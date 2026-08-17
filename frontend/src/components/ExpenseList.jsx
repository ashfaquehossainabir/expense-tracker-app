const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

export default function ExpenseList({ expenses, onView, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="register">
        <div className="empty-state">
          No expenses yet. Click "Add Expense" to log your first one.
        </div>
      </div>
    );
  }

  return (
    <div className="register">
      {expenses.map((expense) => (
        <div
          className="register-row"
          key={expense._id}
          role="button"
          tabIndex={0}
          onClick={() => onView(expense)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onView(expense);
            }
          }}
        >
          <div className="register-main">
            <div className="register-title">{expense.title}</div>
            <div className="register-meta">
              <span>{dateFormatter.format(new Date(expense.date))}</span>
              <span className="category-tag">{expense.category}</span>
            </div>
          </div>
          <div className="register-amount">-${Number(expense.amount).toFixed(2)}</div>
          <div className="register-actions">
            <button
              className="icon-button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(expense);
              }}
              aria-label={`Edit ${expense.title}`}
              title="Edit"
            >
              ✎
            </button>
            <button
              className="icon-button danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(expense);
              }}
              aria-label={`Delete ${expense.title}`}
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
