import { useCallback, useEffect, useRef, useState } from 'react';
import { character as c, settings } from './data/character';
import { BootSequence } from './components/BootSequence';
import { BustViewer } from './components/BustViewer';
import { SystemError } from './components/SystemError';
import { BreachTerminal } from './components/BreachTerminal';
export default function App() {
  const terminal = useRef<HTMLDivElement>(null);
  const [systemError, setSystemError] = useState(false);
  const [restored, setRestored] = useState(false);
  const classified = useRef<HTMLElement>(null);
  const [boot, setBoot] = useState(true);
  const [game, setGame] = useState(false);
  const [unlocked, setUnlocked] = useState(() => { try { return localStorage.getItem(settings.storageKey)==='complete'; } catch { return false; } });
  const finishBoot = useCallback(() => {
    setBoot(false);
    requestAnimationFrame(() => terminal.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => {
    if (boot) return;
    const timer = window.setTimeout(() => setSystemError(true), settings.boot.errorDelayMs);
    return () => clearTimeout(timer);
  }, [boot]);
  useEffect(() => {
    if (!restored) return;
    const timer = window.setTimeout(() => setRestored(false), 5000);
    return () => clearTimeout(timer);
  }, [restored]);
  const completeRecovery = useCallback(() => {
    setSystemError(false);
    setRestored(true);
    requestAnimationFrame(() => terminal.current?.focus({ preventScroll: true }));
  }, []);
  function success() { setUnlocked(true); setGame(false); requestAnimationFrame(() => classified.current?.focus()); try { localStorage.setItem(settings.storageKey,'complete'); } catch { /* Private browsing still permits this session. */ } }
  return <>
    {!boot && !systemError && <a className="skip-link" href="#dossier">Skip to identity dossier</a>}
    {boot && <BootSequence done={finishBoot}/>}
    <div ref={terminal} tabIndex={-1} inert={boot || systemError || undefined} className={`site-shell ${!settings.showDossierDetails ? 'minimal-identity' : ''} ${systemError ? 'system-fault' : ''} ${!boot ? 'terminal-launched' : ''}`}>
      <header className="identity-header"><span className="wordmark" aria-label="Bruhe">BRUHE<span>®</span></span><div className="header-system mono">ADVANCED HUMAN MODIFICATION<br/><span>{settings.terminalVersion} / SECURE TERMINAL</span></div><span className="connection mono"><i className="dot"/> LINK ACTIVE</span></header>
      {settings.showDossierDetails && <div className="archive-bar mono"><span>PERSONNEL ARCHIVE <b>/</b> {c.id}</span></div>}
      <main id="dossier">
        <div className="editorial-heading"><div>{settings.showDossierDetails && <span className="eyebrow">A HUMAN ASSET. AN UNKNOWN VARIABLE.</span>}<h1>IDENTIFICATION</h1></div>{settings.showDossierDetails && <span className="issue mono">N° 077<br/>NIGHT CITY SECTOR<br/><b>PERSONNEL DOSSIER</b></span>}</div>
        <div className="primary-layout"><BustViewer/><section className="identity-record" aria-labelledby="subject-name">{settings.showDossierDetails && <div className="record-label mono"><span>SUBJECT / 077</span><span className="status"><i className="dot"/>{c.status}</span></div>}<h2 id="subject-name">{c.name}</h2>{settings.showDossierDetails && <><div className="identity-code mono"><span>{c.id}</span><span>◧ VERIFIED RECORD</span></div><dl className="facts">{[['Affiliation',c.affiliation],['Faction',c.faction],['Occupation',c.occupation],['Augmentation',c.augmentation],['Clearance',c.clearance]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}<div><dt>Threat assessment</dt><dd className="threat"><span className="threat-bars">▮▮▮▯▯</span> {c.threat}</dd></div></dl><div className="record-foot mono"><span>RECORD INTEGRITY</span><span className="cyan">98.7% / ACCEPTABLE</span></div></>}</section></div>
        {settings.showDossierDetails && settings.showUnfinishedSections && <div className="secondary-layout"><section className="field-notes"><div className="section-heading"><span className="eyebrow">01 / FIELD INTELLIGENCE</span><span className="mono">[ DECRYPTED ]</span></div><h3>Pretty dangerous.</h3><p>{c.biography}</p><div className="notes">{(c.notes ?? []).map((note,i) => <p key={note}><span className="mono">0{i+1} //</span>{note}</p>)}</div><span className="sample-label mono">FICTIONAL SAMPLE RECORD / EDITABLE PERSONNEL DATA</span></section>
        {c.classified && <section ref={classified} tabIndex={-1} className={`classified-file ${unlocked ? 'unlocked' : ''}`} aria-labelledby="classified-title"><div className="section-heading"><span className="eyebrow">02 / BLACK ARCHIVE</span><span className="lock-icon">{unlocked ? '⌁' : '⊠'}</span></div><span className="file-number mono">FILE NX_077_X // {unlocked ? 'DECRYPTED' : 'ENCRYPTED'}</span><h3 id="classified-title">{unlocked ? c.classified.title : <>Some things<br/>stay off the record.</>}</h3>{unlocked ? <div className="secret-content"><p>{c.classified.secret}</p><div className="mission"><span className="eyebrow">YOUR OBJECTIVE</span><p>{c.classified.mission}</p><span className="eyebrow">CONTACT PASSPHRASE</span><blockquote>{c.classified.passphrase}</blockquote></div></div> : <><p>Your clearance ends here.<br/>Your curiosity doesn’t have to.</p><div className="redacted-lines" aria-hidden="true"><i/><i/><i/></div><button className="primary-button" onClick={() => setGame(true)}>INITIATE BREACH PROTOCOL</button><span className="simulation-note mono">INTERACTIVE FICTION / EST. 15 SEC</span></>}</section>}</div>}
      </main>
      <footer className="system-footer"><div className="footer-brand">B</div><p className="mono">BRUHE APPLIED HUMAN SYSTEMS<br/><span>YOUR IDENTITY. OUR INTELLECTUAL PROPERTY.</span></p><span className="mono footer-legal">FICTIONAL EXPERIENCE / NO DATA COLLECTED<br/>TERMINAL {settings.terminalVersion} © 2077 BRUHE</span></footer>
    </div>
    {restored && <div className="recovery-toast mono" role="status">✓ SYSTEM RESTORED. HYDRATION PROTOCOL COMPLETE</div>}
    {systemError && <SystemError onRecovered={completeRecovery}/>}
    {settings.showDossierDetails && settings.showUnfinishedSections && game && <BreachTerminal onClose={() => setGame(false)} onSuccess={success}/>}
  </>;
}
