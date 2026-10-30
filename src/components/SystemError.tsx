import { useEffect, useRef, useState } from 'react';

interface SystemErrorProps {
  onRecovered: () => void;
}

export function SystemError({ onRecovered }: SystemErrorProps) {
  const [recovering, setRecovering] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    heading.current?.focus();
    return () => { document.body.style.overflow = overflow; };
  }, []);

  useEffect(() => {
    if (!recovering) return;
    heading.current?.focus();
    const timer = window.setTimeout(onRecovered,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 350 : 1800);
    return () => clearTimeout(timer);
  }, [recovering, onRecovered]);

  return <div className="error-backdrop">
    <div ref={dialog} className={`system-error ${recovering ? 'recovering' : ''}`}
      role="alertdialog" aria-modal="true" aria-labelledby="system-error-title"
      aria-describedby="beer-instruction error-simulation"
      onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); }
        if (event.key !== 'Tab') return;
        event.preventDefault();
        const button = dialog.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
        (button ?? heading.current)?.focus();
      }}>
      <div className="error-stripe" aria-hidden="true"/>
      <div className="error-top mono"><span><i/> BRUHE / FAILURE REPORT</span></div>
      <div className="error-emblem" aria-hidden="true">!</div>
      <span className="error-code mono">ERROR CODE: BRUHE-0xBEER</span>
      <h2 id="system-error-title" ref={heading} tabIndex={-1}>CRITICAL<br/><span>SYSTEM ERROR</span></h2>
      <div className="malfunction-label mono">CRITICAL MALFUNCTION</div>
      <p id="beer-instruction" className="beer-instruction">Critical system malfunction. <strong>Add beer to reboot.</strong></p>
      <dl className="error-diagnostics mono">
        <div><dt>NEURAL RESPONSE:</dt><dd>DEGRADED</dd></div>
        <div><dt>MOTOR FUNCTIONS:</dt><dd>UNSTABLE</dd></div>
        <div><dt>SYSTEM REBOOT:</dt><dd>{recovering ? 'IN PROGRESS' : 'PENDING'}</dd></div>
        <div className="required-input"><dt>REQUIRED INPUT:</dt><dd>1× BEER</dd></div>
      </dl>
      <div role="status" className="reboot-status mono">{recovering ? 'REBOOTING // RESTORING NEURAL FUNCTIONS…' : 'AWAITING MANUAL HYDRATION'}</div>
      <div className="reboot-progress" aria-hidden="true"><span/></div>
      <button className="beer-button" disabled={recovering} onClick={() => setRecovering(true)}>{recovering ? 'REBOOT IN PROGRESS' : 'BEER DELIVERED'}</button>
      <p id="error-simulation" className="error-simulation mono">FICTIONAL CYBERNETIC FAILURE<br/>BIOLOGICAL SYSTEMS ARE NOT COVERED BY WARRANTY.</p>
      <div className="error-stripe" aria-hidden="true"/>
    </div>
  </div>;
}
