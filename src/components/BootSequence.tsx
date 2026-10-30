import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { settings } from '../data/character';
import { bootSnapshot } from './bootTimeline';
import './BootSequence.css';

const diagnostics = [
  ['NEURAL KERNEL', 'OK'], ['ORGANIC HARDWARE', 'MOUNTED'],
  ['SYNTHETIC EGO MODULE', 'OK'], ['PERSONALITY DRIVERS', 'LOADED'],
  ['CORPORATE LOYALTY INDEX', 'UNSTABLE'], ['MORAL COMPASS', 'NOT INSTALLED'],
  ['EMOTIONAL REGULATION', 'DEPRECATED'], ['EMPLOYEE COMPLIANCE', 'FAILED'],
  ['BIOLOGICAL LIMITERS', 'BYPASSED'], ['ALCOHOL DEPENDENCY SUBSYSTEM', 'CHECK PENDING'],
];
const coldLines = ['BRUHE BIOS v77.4', '© 2077 BRUHE CORPORATION', 'ADVANCED HUMAN MODIFICATION', 'BOOTLOADER INITIALIZED', 'CONNECTING TO NEURAL HOST…', 'ORGANIC HARDWARE DETECTED'];

export function BootSequence({ done }: { done: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const skip = useRef<HTMLButtonElement>(null);
  const duration = reduced ? settings.boot.reducedMotionMs : settings.boot.durationMs;
  const snapshot = bootSnapshot(elapsed, duration);
  const stage = reduced ? 'online' : snapshot.stage;

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed = () => setReduced(preference.matches);
    preference.addEventListener('change', changed);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    skip.current?.focus({ preventScroll: true });
    return () => { document.body.style.overflow = previous; preference.removeEventListener('change', changed); };
  }, []);

  useEffect(() => {
    let frame = 0, last = -100;
    const start = performance.now();
    // Completion does not depend on images, animation events, or a visible tab.
    const timer = window.setTimeout(done, duration);
    function tick(now: number) {
      const time = now - start;
      if (time - last >= 45) { setElapsed(time); last = time; }
      frame = requestAnimationFrame(tick);
    }
    if (!reduced) frame = requestAnimationFrame(tick);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [done, duration, reduced]);

  return <div className={`bios-boot bios-${stage} ${snapshot.exiting && !reduced ? 'bios-exit' : ''} ${reduced ? 'bios-reduced' : ''}`}
    style={{ '--boot-duration': `${duration}ms` } as CSSProperties}
    role="dialog" aria-modal="true" aria-label="BRUHE operating system startup"
    onClick={done} onKeyDown={event => {
      if (event.key === 'Escape') done();
      if (event.key === 'Tab') { event.preventDefault(); skip.current?.focus(); }
    }}>
    <div className="bios-interference" aria-hidden="true"/>
    <div className="bios-monitor">
      <header className="bios-masthead"><span>BRUHE<span className="bios-registered">®</span></span><div>ADVANCED HUMAN<br/>MODIFICATION<span>PROPRIETARY NEURAL SYSTEMS</span></div></header>
      <div className="bios-rail"><span>POST / {stage === 'cold' ? '01' : stage === 'diagnostics' ? '02' : stage === 'sync' ? '03' : '04'}</span><span>HOST: ORGANIC</span><span className="bios-led">● LIVE</span></div>
      <div className="bios-stage" aria-hidden="true">
        {stage === 'cold' && <section className="bios-cold"><div className="bios-stage-label">// COLD START — ROM 0x0000FF</div>{coldLines.map((line, index) => <p key={line} className={snapshot.progress >= index * .026 ? 'bios-line-visible' : ''}>{line}</p>)}<span className="bios-cursor">█</span><div className="bios-memory">640K ORGANIC MEMORY AVAILABLE<br/>WARRANTY VOID IF SELF-AWARE.</div></section>}
        {stage === 'diagnostics' && <section className="bios-diagnostics"><div className="bios-stage-label">// POWER-ON SELF TEST</div><h2>EXPENSIVE BODY.<br/><span>QUESTIONABLE SOFTWARE.</span></h2><div className="bios-log">{diagnostics.map(([name, status], index) => <div key={name} className={`${snapshot.diagnosticCount > index ? 'bios-line-visible' : ''} ${index >= 4 ? 'bios-log-warning' : ''}`}><span className="bios-address">{(0xF000 + index * 256).toString(16).toUpperCase()}</span><span>{name}</span><b>{status}</b></div>)}</div><div className="bios-command">C:\BRUHE\SYS&gt; override --ethics=off <span className="bios-cursor">█</span></div></section>}
        {stage === 'sync' && <section className="bios-sync"><div className="bios-stage-label">// NEURAL HOST SYNCHRONIZATION</div><div className="bios-scope"><div className="bios-reticle"><svg viewBox="0 0 160 180"><path d="M55 154V132L35 115V54L50 25L80 14L110 25L125 54V115L105 132V154M35 54L80 44L125 54M35 84L80 97L125 84M35 115L80 123L125 115M50 25L55 70L45 105L80 123L115 105L105 70L110 25M80 14V155M55 154L25 168M105 154L135 168M55 70H105M55 154H105"/></svg><span>SUBJECT MESH / LOCKING</span></div><div className="bios-scope-data"><span>NEURAL BUS</span><strong>{String(snapshot.percent).padStart(2, '0')}<small>%</small></strong><span>0x{(0xA000 + Math.floor(elapsed / 60) * 47).toString(16).toUpperCase()}</span><svg className="bios-wave" viewBox="0 0 180 60"><path d="M0 30H20L27 20L34 40L43 7L51 52L58 30H80L87 24L94 36L103 14L111 46L119 30H140L148 19L155 40L162 30H180"/></svg><span>EEG / ±077 mV</span></div></div><div className="bios-segments">{Array.from({length: 24}, (_, i) => <i key={i} className={i < Math.round(snapshot.percent / 100 * 24) ? 'lit' : ''}/>)}</div><div className="bios-sync-readout"><span>SYNC_BUFFER / {snapshot.percent < 60 ? 'REPAIRING' : 'WRITING'}</span><span>IRQ 07 // DMA 04</span></div><div className="bios-warning">! UNAUTHORIZED MODIFICATION DETECTED</div><p className="bios-command">ACCEPTING LIABILITY ON YOUR BEHALF…</p></section>}
        {stage === 'online' && <section className="bios-online"><span className="bios-stage-label">// ROOT ACCESS ASSUMED</span><div className="bios-online-mark">[ ✓ ]</div><h2>IDENTITY<br/><span>ACQUIRED</span></h2><div className="bios-online-copy">BRUHE // IDENTIFICATION SYSTEM<br/>BIOMETRIC PROFILE LOADED<br/><span>UNAUTHORIZED VIEWER CONNECTED</span></div><div className="bios-command">LAUNCHING PERSONNEL ARCHIVE <span className="bios-cursor">█</span></div></section>}
      </div>
      <p className="bios-accessible-status" role="status">{reduced ? 'BRUHE identification system ready.' : {cold: 'Initializing BRUHE BIOS.', diagnostics: 'Checking organic hardware.', sync: 'Synchronizing neural host.', online: 'Identity acquired. Opening identification system.'}[stage]}</p>
      <footer className="bios-footer"><div className="bios-hazard"/><p>YOUR BODY. OUR INTELLECTUAL PROPERTY.<br/><span>PLEASE DO NOT REMOVE EMPLOYEE DURING STARTUP.</span></p><button ref={skip} onClick={event => { event.stopPropagation(); done(); }}>TAP TO SKIP STARTUP <span>↵</span></button><div className="bios-registration"><span>BRH–77 / REV. F</span><span>PROPERTY OF BRUHE CORP.</span><span>＋</span></div></footer>
    </div>
  </div>;
}
