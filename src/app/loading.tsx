export default function Loading() {
  return (
    <main className="system-state" aria-busy="true" aria-live="polite">
      <div className="system-state__content">
        <span className="state-loader" aria-hidden="true" />
        <p>Preparing the experience…</p>
      </div>
    </main>
  );
}
