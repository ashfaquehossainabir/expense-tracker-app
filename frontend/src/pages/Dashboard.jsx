import { useEffect, useState } from "react";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../api/expenseApi";
import {
  fetchIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../api/incomeApi";
import { useAuth } from "../context/AuthContext";
import SummaryCard from "../components/SummaryCard";
import ExpenseList from "../components/ExpenseList";
import ExpenseModal from "../components/ExpenseModal";
import IncomeList from "../components/IncomeList";
import IncomeModal from "../components/IncomeModal";
import EntryDetailModal from "../components/EntryDetailModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import UserAvatar from "../components/UserAvatar";
import AccountSettingsModal from "../components/AccountSettingsModal";
import ConfirmDeleteAccountModal from "../components/ConfirmDeleteAccountModal";

export default function Dashboard() {
  const { user, logout, deleteAccount } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Expense modal state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [savingExpense, setSavingExpense] = useState(false);

  // Income modal state
  const [incomeModalOpen, setIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [savingIncome, setSavingIncome] = useState(false);

  // Shared detail-view state (works for either type)
  const [viewTarget, setViewTarget] = useState(null); // { type: 'expense' | 'income', item }

  // Shared delete-confirmation state (works for either type)
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'expense' | 'income', item }
  const [deleting, setDeleting] = useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteAccountConfirmOpen, setDeleteAccountConfirmOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [expenseData, incomeData] = await Promise.all([fetchExpenses(), fetchIncomes()]);
      setExpenses(expenseData);
      setIncomes(incomeData);
    } catch (err) {
      setError("Couldn't reach the server. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Expense handlers ----------

  const openAddExpense = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  const openEditExpense = (expense) => {
    setViewTarget(null);
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    if (savingExpense) return;
    setExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const handleExpenseSubmit = async (payload) => {
    setSavingExpense(true);
    try {
      if (editingExpense) {
        const updated = await updateExpense(editingExpense._id, payload);
        setExpenses((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
      } else {
        const created = await createExpense(payload);
        setExpenses((prev) => [created, ...prev]);
      }
      setExpenseModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      setError("Couldn't save that expense. Check the form and try again.");
    } finally {
      setSavingExpense(false);
    }
  };

  // ---------- Income handlers ----------

  const openAddIncome = () => {
    setEditingIncome(null);
    setIncomeModalOpen(true);
  };

  const openEditIncome = (income) => {
    setViewTarget(null);
    setEditingIncome(income);
    setIncomeModalOpen(true);
  };

  const closeIncomeModal = () => {
    if (savingIncome) return;
    setIncomeModalOpen(false);
    setEditingIncome(null);
  };

  const handleIncomeSubmit = async (payload) => {
    setSavingIncome(true);
    try {
      if (editingIncome) {
        const updated = await updateIncome(editingIncome._id, payload);
        setIncomes((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      } else {
        const created = await createIncome(payload);
        setIncomes((prev) => [created, ...prev]);
      }
      setIncomeModalOpen(false);
      setEditingIncome(null);
    } catch (err) {
      setError("Couldn't save that income entry. Check the form and try again.");
    } finally {
      setSavingIncome(false);
    }
  };

  // ---------- Detail view flow ----------

  const requestViewExpense = (expense) => setViewTarget({ type: "expense", item: expense });
  const requestViewIncome = (income) => setViewTarget({ type: "income", item: income });

  // ---------- Shared delete flow ----------

  const requestDeleteExpense = (expense) => {
    setViewTarget(null);
    setDeleteTarget({ type: "expense", item: expense });
  };

  const requestDeleteIncome = (income) => {
    setViewTarget(null);
    setDeleteTarget({ type: "income", item: income });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "expense") {
        await deleteExpense(deleteTarget.item._id);
        setExpenses((prev) => prev.filter((e) => e._id !== deleteTarget.item._id));
      } else {
        await deleteIncome(deleteTarget.item._id);
        setIncomes((prev) => prev.filter((i) => i._id !== deleteTarget.item._id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setError("Couldn't delete that entry. Try again.");
    } finally {
      setDeleting(false);
    }
  };

  // ---------- Account settings flow ----------

  const requestLogoutFromSettings = () => {
    setSettingsOpen(false);
    setLogoutConfirmOpen(true);
  };

  const requestDeleteAccount = () => {
    setSettingsOpen(false);
    setDeleteAccountConfirmOpen(true);
  };

  const handleDeleteAccountConfirm = async (password) => {
    setDeletingAccount(true);
    try {
      await deleteAccount({ password });
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">Ledger</h1>
          <div className="app-subtitle">
            {user ? `${user.name}'s expense register` : "Personal expense register"}
          </div>
        </div>
        <UserAvatar user={user} onClick={() => setSettingsOpen(true)} />
      </header>

      <SummaryCard incomes={incomes} expenses={expenses} />

      {loading && <div className="status-line">Loading entries…</div>}
      {error && <div className="status-line error">{error}</div>}

      {!loading && !error && (
        <div className="sections-grid">
          <section className="section-card">
            <div className="section-header">
              <div className="section-heading">
                <h2 className="section-title">Income</h2>
                <span className="count-badge income">{incomes.length}</span>
              </div>
              <button className="stamp-button" onClick={openAddIncome}>
                + Add Income
              </button>
            </div>
            <IncomeList
              incomes={incomes}
              onView={requestViewIncome}
              onEdit={openEditIncome}
              onDelete={requestDeleteIncome}
            />
          </section>

          <section className="section-card">
            <div className="section-header">
              <div className="section-heading">
                <h2 className="section-title">Expenses</h2>
                <span className="count-badge expense">{expenses.length}</span>
              </div>
              <button className="stamp-button expense" onClick={openAddExpense}>
                + Add Expense
              </button>
            </div>
            <ExpenseList
              expenses={expenses}
              onView={requestViewExpense}
              onEdit={openEditExpense}
              onDelete={requestDeleteExpense}
            />
          </section>
        </div>
      )}

      <ExpenseModal
        open={expenseModalOpen}
        initialExpense={editingExpense}
        onClose={closeExpenseModal}
        onSubmit={handleExpenseSubmit}
        saving={savingExpense}
      />

      <IncomeModal
        open={incomeModalOpen}
        initialIncome={editingIncome}
        onClose={closeIncomeModal}
        onSubmit={handleIncomeSubmit}
        saving={savingIncome}
      />

      <EntryDetailModal
        open={Boolean(viewTarget)}
        type={viewTarget?.type}
        item={viewTarget?.item}
        onClose={() => setViewTarget(null)}
        onEdit={(item) =>
          viewTarget?.type === "income" ? openEditIncome(item) : openEditExpense(item)
        }
        onDelete={(item) =>
          viewTarget?.type === "income" ? requestDeleteIncome(item) : requestDeleteExpense(item)
        }
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        item={deleteTarget?.item}
        itemLabel={deleteTarget?.type === "income" ? "Income" : "Expense"}
        onCancel={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      <ConfirmLogoutModal
        open={logoutConfirmOpen}
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          logout();
        }}
      />

      <AccountSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onRequestLogout={requestLogoutFromSettings}
        onRequestDelete={requestDeleteAccount}
      />

      <ConfirmDeleteAccountModal
        open={deleteAccountConfirmOpen}
        onCancel={() => !deletingAccount && setDeleteAccountConfirmOpen(false)}
        onConfirm={handleDeleteAccountConfirm}
        deleting={deletingAccount}
      />
    </div>
  );
}
