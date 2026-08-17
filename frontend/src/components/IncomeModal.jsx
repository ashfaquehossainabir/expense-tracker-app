import { useEffect, useState } from "react";

const SOURCES = ["Salary", "Freelance", "Business", "Investment", "Gift", "Other"];

const emptyForm = {
  title: "",
  amount: "",
  source: "Salary",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function IncomeModal({ open, initialIncome, onClose, onSubmit, saving }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (initialIncome) {
      setForm({
        title: initialIncome.title ?? "",
        amount: String(initialIncome.amount ?? ""),
        source: initialIncome.source ?? "Salary",
        date: initialIncome.date
          ? new Date(initialIncome.date).toISOString().slice(0, 10)
          : emptyForm.date,
        note: initialIncome.note ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, initialIncome]);

  if (!open) return null;

  const isEdit = Boolean(initialIncome);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = "Enter a title for this income.";
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
      source: form.source,
      date: form.date,
      note: form.note.trim(),
    });
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="income-modal-title"
      >
        <div className="modal-header">
          <h2 className="modal-title" id="income-modal-title">
            {isEdit ? "Edit Income" : "Add Income"}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="income-title">Title</label>
            <input
              id="income-title"
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="e.g. August paycheck"
              autoFocus
            />
            {errors.title && <div className="field-error">{errors.title}</div>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="income-amount">Amount</label>
              <input
                id="income-amount"
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
              <label htmlFor="income-date">Date</label>
              <input
                id="income-date"
                type="date"
                value={form.date}
                onChange={handleChange("date")}
              />
              {errors.date && <div className="field-error">{errors.date}</div>}
            </div>
          </div>

          <div className="field">
            <label htmlFor="income-source">Source</label>
            <select id="income-source" value={form.source} onChange={handleChange("source")}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="income-note">Note (optional)</label>
            <textarea
              id="income-note"
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
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
