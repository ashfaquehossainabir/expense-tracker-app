export default function PageLoader({ message = "Loading your ledger" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-seal">
        <span className="page-loader-ring" aria-hidden="true" />
        <span className="page-loader-mark" aria-hidden="true">
          L
        </span>
      </div>
      <div className="page-loader-title">Ledger</div>
      <div className="page-loader-text">
        {message}
        <span className="page-loader-dots" aria-hidden="true">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
}
