import { useAuth } from "../context/AuthContext";
import { formatAmount } from "../utils/currency";

export default function SummaryCard({ incomes, expenses }) {
  const { user } = useAuth();
  const currency = user?.currency;
  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className="summary-card">
      <div className="summary-eyebrow">Total balance · income minus expenses</div>
      <div className={`summary-total ${balance < 0 ? "negative" : ""}`}>
        {balance < 0 ? "-" : ""}
        {formatAmount(Math.abs(balance), currency)}
      </div>
      <div className="summary-row">
        <div className="summary-stat income">
          Total income
          <strong>{formatAmount(totalIncome, currency)}</strong>
        </div>
        <div className="summary-stat expense">
          Total expenses
          <strong>{formatAmount(totalExpenses, currency)}</strong>
        </div>
        <div className="summary-stat">
          Entries logged
          <strong>{incomes.length + expenses.length}</strong>
        </div>
      </div>
    </div>
  );
}
