import { useEffect, useRef, useState } from 'react';
const symbols = ['7A', 'E9', 'BD', '1C', '55', 'F0'];
export function BreachTerminal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [sequence, setSequence] = useState(() => makeSequence());
  const [phase, setPhase] = useState<'observe'|'input'|'failed'|'success'>('observe');
  const [count, setCount] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  function makeSequence() { return Array.from({length:4}, () => Math.floor(Math.random()*symbols.length)); }
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow='hidden'; close.current?.focus();
    return () => { document.body.style.overflow=overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    if (phase !== 'observe') return;
    const timer = window.setTimeout(() => setPhase('input'), 6500);
    return () => clearTimeout(timer);
  }, [phase, sequence]);
  useEffect(() => {
    if (phase !== 'success') return;
    const timer = window.setTimeout(onSuccess, 1100);
    return () => clearTimeout(timer);
  }, [phase, onSuccess]);
  function input(index: number) {
    if (phase !== 'input') return;
    if (sequence[count] !== index) { setPhase('failed'); return; }
    setCount(n => n+1);
    if (count === sequence.length-1) setPhase('success');
  }
  return <div className="modal-backdrop"><div className={`breach-terminal ${phase}`} ref={dialog} role="dialog" aria-modal="true" aria-labelledby="breach-title" onKeyDown={e => {
    if (e.key==='Escape') onClose();
    if(e.key==='Tab') {
      const nodes = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!nodes?.length) return;
      if(e.shiftKey && document.activeElement===nodes[0]) { e.preventDefault(); nodes[nodes.length-1].focus(); }
      else if(!e.shiftKey && document.activeElement===nodes[nodes.length-1]) { e.preventDefault(); nodes[0].focus(); }
    }
  }}>
    <div className="terminal-top mono"><span>UNAUTHORIZED CONNECTION</span><button ref={close} onClick={onClose} aria-label="Close breach terminal">×</button></div>
    <span className="eyebrow">// LOCAL SIMULATION</span><h2 id="breach-title">GHOST<br/><em>PROTOCOL.</em></h2>
    <p className="game-instruction" aria-live="polite">{phase==='observe' ? 'Memorize these four signal codes, in order. They disappear in a moment.' : phase==='input' ? 'Reconstruct the signal. Tap the four codes in the original order.' : phase==='failed' ? 'Signal mismatch. Corporate security has been mildly inconvenienced.' : 'Identity firewall bypassed. Opening the hidden record…'}</p>
    <div className="sequence" aria-label="Signal sequence">{sequence.map((s,i) => <span key={i} className={i<count ? 'complete' : ''}>{phase==='observe' ? symbols[s] : i<count ? symbols[s] : '••'}</span>)}</div>
    {phase==='observe' && <button className="text-button mono" onClick={() => setPhase('input')}>SIGNAL MEMORIZED →</button>}
    <div className="signal-grid">{symbols.map((s,i) => <button key={s} disabled={phase!=='input'} onClick={() => input(i)}>{s}<small>0{i+1}</small></button>)}</div>
    <div className="game-status mono" role="status">{phase==='observe' ? 'BUFFER CAPTURE IN PROGRESS' : phase==='input' ? `DECODING / ${count} OF 4` : phase==='failed' ? 'ACCESS DENIED // TRY AGAIN' : 'ACCESS GRANTED ✓'}</div>
    {phase==='failed' && <button className="primary-button" onClick={() => { setCount(0); setSequence(makeSequence()); setPhase('observe'); }}>RETRY SIGNAL CAPTURE ↻</button>}
    <p className="simulation-note mono">Fictional breach. No networks or devices are accessed.</p>
  </div></div>;
}
