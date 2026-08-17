const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function EntryDetailModal({ open, type, item, onClose, onEdit, onDelete }) {
  if (!open || !item) return null;

  const isIncome = type === "income";
  const tag = isIncome ? item.source : item.category;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="detail-modal-title">
            {isIncome ? "Income Detail" : "Expense Detail"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className={`detail-amount ${isIncome ? "income" : "expense"}`}>
          {isIncome ? "+" : "-"}${Number(item.amount).toFixed(2)}
        </div>
        <div className="detail-entry-title">{item.title}</div>

        <div className="detail-list">
          <div className="detail-row">
            <span className="detail-label">{isIncome ? "Source" : "Category"}</span>
            <span className="category-tag">{tag}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">{dateFormatter.format(new Date(item.date))}</span>
          </div>
          {item.note && (
            <div className="detail-row detail-row-note">
              <span className="detail-label">Note</span>
              <span className="detail-value detail-note">{item.note}</span>
            </div>
          )}
          {item.updatedAt && (
            <div className="detail-row">
              <span className="detail-label">Last updated</span>
              <span className="detail-value detail-faint">
                {timeFormatter.format(new Date(item.updatedAt))}
              </span>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-danger" onClick={() => onDelete(item)}>
            Delete
          </button>
          <button className="btn btn-primary" onClick={() => onEdit(item)}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
