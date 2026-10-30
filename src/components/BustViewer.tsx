import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { settings } from '../data/character';
type Config = typeof settings.bust;
export function BustViewer({ config = settings.bust }: { config?: Config }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef({ position: 0, lastInput: 0, dragging: false, x: 0 });
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const [finished, setFinished] = useState(false);
  const [angle, setAngle] = useState(0);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false, raf = 0, previous = 0, drawn = -1, lastLabel = 0;
    const frames: (HTMLImageElement | undefined)[] = Array(config.frameCount);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setLoaded(0); setReady(false); setFinished(false);
    const draw = (index: number) => {
      const available = frames.map((f, i) => f ? i : -1).filter(i => i >= 0);
      if (!available.length) return;
      const nearest = available.reduce((a, b) => {
        const distance = (i: number) => Math.min(Math.abs(i-index), config.frameCount-Math.abs(i-index));
        return distance(a) <= distance(b) ? a : b;
      });
      if (nearest === drawn) return;
      const el = canvas.current, img = frames[nearest];
      if (!el || !img) return;
      const ctx = el.getContext('2d'); if (!ctx) return;
      const scale = Math.min(el.width / img.naturalWidth, el.height / img.naturalHeight);
      ctx.clearRect(0, 0, el.width, el.height);
      ctx.drawImage(img, (el.width-img.naturalWidth*scale)/2, el.height-img.naturalHeight*scale, img.naturalWidth*scale, img.naturalHeight*scale);
      drawn = nearest;
    };
    // Four concurrent requests; the first view appears before the entire set loads.
    let next = 0;
    async function worker() {
      while (!cancelled && next < config.frameCount) {
        const index = next++;
        const img = new Image(); img.decoding = 'async';
        await new Promise<void>(resolve => {
          img.onload = () => { if (!cancelled) { frames[index] = img; setLoaded(n => n+1); setReady(true); drawn = -1; } resolve(); };
          img.onerror = () => resolve();
          img.src = `${config.path}/frame-${String(index+1).padStart(3,'0')}.${config.extension}`;
        });
      }
    }
    Promise.all(Array.from({length: 4}, worker)).then(() => { if (!cancelled) setFinished(true); });
    function tick(time: number) {
      const e = engine.current;
      if (previous && !document.hidden && !motion.matches && !e.dragging && time-e.lastInput > config.resumeAfterMs) {
        e.position += Math.min(time-previous, 50) / (config.secondsPerTurn*1000);
      }
      previous = time;
      e.position = ((e.position % 1)+1)%1;
      draw(Math.floor(e.position*config.frameCount)%config.frameCount);
      if (time-lastLabel > 150) { setAngle(Math.round(e.position*360)%360); lastLabel=time; }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [config, retry]);
  const rotate = (delta: number) => { engine.current.position += delta; engine.current.lastInput = performance.now(); };
  return <section className="biometric" aria-label="Interactive biometric reconstruction">
    <div className="view-top mono"><span><i className="dot"/> BIOMETRIC RECONSTRUCTION</span><span>01 / VISUAL</span></div>
    <div className="viewer" role="group" aria-label="360 degree bust viewer">
      <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
      <div className="cross cross-one">+</div><div className="cross cross-two">+</div>
      <div className="side-label mono">LIVE CAPTURE / IDENTITY MESH</div>
      <div className="capture-tag mono">REC <i/> <br/><small>NX_077 // CAM_01</small></div>
      <div className="viewer-touch" tabIndex={ready ? 0 : -1} role="slider" aria-label="Rotate biometric bust" aria-valuemin={0} aria-valuemax={359} aria-valuenow={angle} aria-valuetext={`${angle} degrees`} onKeyDown={e => { if (['ArrowLeft','ArrowRight','Home'].includes(e.key)) { e.preventDefault(); rotate(e.key==='Home' ? -engine.current.position : e.key==='ArrowLeft' ? -1/config.frameCount : 1/config.frameCount); } }}
        onPointerDown={e => { if (!ready) return; e.currentTarget.setPointerCapture(e.pointerId); engine.current.dragging=true; engine.current.x=e.clientX; engine.current.lastInput=performance.now(); }}
        onPointerMove={e => { if (!engine.current.dragging) return; rotate((e.clientX-engine.current.x)/config.pixelsPerTurn); engine.current.x=e.clientX; }}
        onPointerUp={() => { engine.current.dragging=false; engine.current.lastInput=performance.now(); }}
        onLostPointerCapture={() => { engine.current.dragging=false; engine.current.lastInput=performance.now(); }}
        onPointerCancel={() => { engine.current.dragging=false; engine.current.lastInput=performance.now(); }}>
        <canvas ref={canvas} width={900} height={1000} className={ready ? 'bust-canvas visible' : 'bust-canvas'} />
        {!ready && <div className="anonymous" aria-label="Temporary anonymous silhouette"><svg viewBox="0 0 320 380" aria-hidden="true"><defs><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#777e72"/><stop offset=".45" stopColor="#272f29"/><stop offset="1" stopColor="#101711"/></linearGradient><pattern id="lines" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H5" stroke="#b6cdad" strokeOpacity=".12"/></pattern></defs><path d="M31 374L42 306Q47 286 87 275L122 257L124 230Q98 213 95 175Q83 173 83 151Q82 140 92 140L91 105Q91 40 157 34Q225 32 229 103L228 140Q241 135 240 154Q239 176 228 178Q223 212 199 230L200 257L238 275Q278 284 283 307L295 374Z" fill="url(#body)" stroke="#9daa8f" strokeOpacity=".45"/><path d="M31 374L42 306Q47 286 87 275L122 257L124 230Q98 213 95 175Q83 173 83 151Q82 140 92 140L91 105Q91 40 157 34Q225 32 229 103L228 140Q241 135 240 154Q239 176 228 178Q223 212 199 230L200 257L238 275Q278 284 283 307L295 374Z" fill="url(#lines)"/><path d="M96 144H227M105 190H220M124 230Q161 251 199 230M122 257L160 288L200 257" fill="none" stroke="#b9d99a" strokeOpacity=".3"/><path d="M160 35V372" stroke="#b9d99a" strokeOpacity=".18" strokeDasharray="3 5"/></svg><div className="redacted mono">IDENTITY WITHHELD</div></div>}
        <div className="scan-sweep"/><div className="scanlines"/>
      </div>
      <div className="profile-stamp mono"><span>{ready ? 'CAPTURE ONLINE' : 'CAPTURE PENDING'}</span><b>{ready ? `${loaded} / ${config.frameCount} FRAMES` : 'TEMPORARY PROFILE'}</b></div>
      <div className="angle mono">Y / {String(angle).padStart(3,'0')}°<span>↔</span></div>
    </div>
    <div className="viewer-bottom mono"><span>{ready ? '↔ DRAG TO ROTATE' : finished ? 'AWAITING BIOMETRIC ASSETS' : 'CONNECTING TO CAPTURE…'}</span><span className="cyan">{ready ? 'SEQUENCE ACTIVE' : 'NO FACE DATA'}</span></div>
    {finished && !ready && <button className="retry-assets mono" onClick={() => setRetry(n => n+1)}>RETRY CAPTURE CONNECTION ↻</button>}
    <div className="capture-progress" style={{'--progress': `${loaded/config.frameCount*100}%`} as CSSProperties}/>
  </section>;
}
