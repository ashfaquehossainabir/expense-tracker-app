export default function SummaryCard({ incomes, expenses }) {
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="summary-card">
      <div className="summary-eyebrow">Total balance · income minus expenses</div>
      <div className={`summary-total ${balance < 0 ? "negative" : ""}`}>
        {balance < 0 ? "-" : ""}${Math.abs(balance).toFixed(2)}
      </div>
      <div className="summary-row">
        <div className="summary-stat income">
          Total income
          <strong>${totalIncome.toFixed(2)}</strong>
        </div>
        <div className="summary-stat expense">
          Total expenses
          <strong>${totalExpenses.toFixed(2)}</strong>
        </div>
        <div className="summary-stat">
          Entries logged
          <strong>{incomes.length + expenses.length}</strong>
        </div>
      </div>
    </div>
  );
}
