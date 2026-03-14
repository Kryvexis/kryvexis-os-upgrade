import logo from '../assets/kryvexis-logo.png';

export function SystemIgnitionPage({ onFinish }: { onFinish: () => void }) {
  return (
    <main className="entry-screen ignition-screen">
      <div className="entry-ambient entry-ambient-a" />
      <div className="entry-ambient entry-ambient-b" />
      <div className="ignition-grid" />
      <div className="ignition-arc ignition-arc-a" />
      <div className="ignition-arc ignition-arc-b" />
      <div className="ignition-streak ignition-streak-a" />
      <div className="ignition-streak ignition-streak-b" />

      <section className="ignition-stage">
        <button type="button" className="ghost-button ignition-skip" onClick={onFinish}>Skip intro</button>

        <div className="ignition-copy">
          <p className="eyebrow">System ignition</p>
          <h1>Kryvexis command core coming online.</h1>
          <p className="entry-copy">Finance. Procurement. Inventory. One cinematic operating system.</p>
        </div>

        <div className="ignition-logo-lockup" aria-hidden="true">
          <span className="ignition-glow-ring" />
          <img src={logo} alt="Kryvexis" className="ignition-logo" />
          <div className="ignition-flare" />
        </div>

        <div className="ignition-status-bar">
          <span>Operating core online</span>
          <span>Ready sequence engaged</span>
        </div>
      </section>
    </main>
  );
}
