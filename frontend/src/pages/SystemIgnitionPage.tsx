import { useEffect, useMemo, useState } from 'react';
import logo from '../assets/kryvexis-logo-entry.png';

const phases = [
  {
    eyebrow: 'Phase 01 // ignition',
    title: 'Kryvexis command core waking up.',
    copy: 'Power rails active. Signal paths aligning. The operating system is stepping into view.'
  },
  {
    eyebrow: 'Phase 02 // systems online',
    title: 'Finance, procurement, and stock control in one pulse.',
    copy: 'Collections, buying, inventory pressure, and branch execution move through one intelligent command layer.'
  },
  {
    eyebrow: 'Phase 03 // ready state',
    title: 'Operating intelligence online.',
    copy: 'A cinematic entry into the command center that runs the business like it came from the future.'
  }
] as const;

export function SystemIgnitionPage({ onFinish }: { onFinish: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const phaseTimers = [
      window.setTimeout(() => setPhaseIndex(1), 1700),
      window.setTimeout(() => setPhaseIndex(2), 3800)
    ];
    return () => phaseTimers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const phase = phases[phaseIndex];
  const progressWidth = useMemo(() => `${((phaseIndex + 1) / phases.length) * 100}%`, [phaseIndex]);

  return (
    <main className="entry-screen ignition-screen">
      <div className="entry-ambient entry-ambient-a" />
      <div className="entry-ambient entry-ambient-b" />
      <div className="ignition-grid" />
      <div className="ignition-arc ignition-arc-a" />
      <div className="ignition-arc ignition-arc-b" />
      <div className="ignition-streak ignition-streak-a" />
      <div className="ignition-streak ignition-streak-b" />
      <div className="ignition-orbit ignition-orbit-a" />
      <div className="ignition-orbit ignition-orbit-b" />

      <section className="ignition-stage">
        <button type="button" className="ghost-button ignition-skip" onClick={onFinish}>Skip intro</button>

        <div className="ignition-copy" key={phase.eyebrow}>
          <p className="eyebrow">{phase.eyebrow}</p>
          <h1>{phase.title}</h1>
          <p className="entry-copy">{phase.copy}</p>
        </div>

        <div className="ignition-logo-lockup" aria-hidden="true">
          <span className="ignition-glow-ring" />
          <span className="ignition-core-pulse" />
          <img src={logo} alt="Kryvexis" className="ignition-logo entry-logo-clean" />
          <div className="ignition-flare" />
        </div>

        <div className="ignition-timeline" aria-hidden="true">
          <div className="ignition-progress-track">
            <div className="ignition-progress-fill" style={{ width: progressWidth }} />
          </div>
          <div className="ignition-phase-row">
            {phases.map((item, index) => (
              <span key={item.eyebrow} className={index <= phaseIndex ? 'ignition-phase-dot active' : 'ignition-phase-dot'} />
            ))}
          </div>
        </div>

        <div className="ignition-status-bar">
          <span>System ignition sequence extended</span>
          <span>Signature intro mode engaged</span>
          <span>Ready for command center handoff</span>
        </div>
      </section>
    </main>
  );
}
