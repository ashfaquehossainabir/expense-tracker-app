import { useAuth } from "../context/AuthContext";
import { formatAmount } from "../utils/currency";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function IncomeList({ incomes, onView, onEdit, onDelete }) {
  const { user } = useAuth();

  if (incomes.length === 0) {
    return (
      <div className="register">
        <div className="empty-state">
          No income logged yet. Click "Add Income" to record your first entry.
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      {incomes.map((income) => (
        <div
          className="register-row"
          key={income._id}
          role="button"
          tabIndex={0}
          onClick={() => onView(income)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onView(income);
            }
          }}
        >
          <div className="register-main">
            <div className="register-title">{income.title}</div>
            <div className="register-meta">
              <span>{dateFormatter.format(new Date(income.date))}</span>
              <span className="category-tag">{income.source}</span>
            </div>
          </div>
          <div className="register-amount income">
            +{formatAmount(income.amount, user?.currency)}
          </div>
          <div className="register-actions">
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(income);
              }}
              aria-label={`Edit ${income.title}`}
              title="Edit"
            >
              ✎
            </button>
            <button
              className="icon-button danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(income);
              }}
              aria-label={`Delete ${income.title}`}
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
