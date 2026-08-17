import { useEffect, useState } from "react";

const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

const emptyForm = {
  title: "",
  amount: "",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function ExpenseModal({ open, initialExpense, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (initialExpense) {
      setForm({
        title: initialExpense.title ?? "",
        amount: String(initialExpense.amount ?? ""),
        category: initialExpense.category ?? "Food",
        date: initialExpense.date
          ? new Date(initialExpense.date).toISOString().slice(0, 10)
          : emptyForm.date,
        note: initialExpense.note ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, initialExpense]);

  if (!open) return null;

  const isEdit = Boolean(initialExpense);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Enter a title for this expense.";
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      next.amount = "Enter an amount greater than 0.";
    }
    if (!form.date) next.date = "Pick a date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEdit ? "Edit Entry" : "Add Entry"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="e.g. Grocery run"
              autoFocus
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={handleChange("amount")}
                placeholder="0.00"
              />
              {errors.amount && <div className="field-error">{errors.amount}</div>}
            </div>
            <div className="field">
              <label htmlFor="date">Date</label>
              <input id="date" type="date" value={form.date} onChange={handleChange("date")} />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={handleChange("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="note">Note (optional)</label>
            <textarea
              id="note"
              value={form.note}
              onChange={handleChange("note")}
              placeholder="Any extra detail worth remembering"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
