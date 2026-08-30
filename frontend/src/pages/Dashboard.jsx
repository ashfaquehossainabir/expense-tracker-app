import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  fetchTabs,
  createTab as createTabApi,
  renameTab as renameTabApi,
  deleteTab as deleteTabApi,
} from "../api/tabApi";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import SummaryCard from "../components/SummaryCard";
import ExpenseList from "../components/ExpenseList";
import ExpenseModal from "../components/ExpenseModal";
import IncomeList from "../components/IncomeList";
import IncomeModal from "../components/IncomeModal";
import EntryDetailModal from "../components/EntryDetailModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import ConfirmDeleteTabModal from "../components/ConfirmDeleteTabModal";
import ConfirmLogoutModal from "../components/ConfirmLogoutModal";
import UserAvatar from "../components/UserAvatar";
import AccountSettingsModal from "../components/AccountSettingsModal";
import ConfirmDeleteAccountModal from "../components/ConfirmDeleteAccountModal";

export default function Dashboard() {
  const { user, logout, deleteAccount } = useAuth();

  // ---------- Tabs ----------
  const [tabs, setTabs] = useState([]);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("ledger:sidebarCollapsed") === "1";
  });
  const [deleteTabTarget, setDeleteTabTarget] = useState(null);
  const [deletingTab, setDeletingTab] = useState(false);

  const activeTab = tabs.find((t) => t._id === activeTabId) || null;

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
    loadTabs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTabId) {
      loadEntries(activeTabId);
    } else {
      setExpenses([]);
      setIncomes([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  const loadTabs = async () => {
    setTabsLoading(true);
    setError("");
    try {
      const data = await fetchTabs();
      setTabs(data);
      setActiveTabId((prev) => {
        if (prev && data.some((t) => t._id === prev)) return prev;
        return data[0]?._id || null;
      });
    } catch (err) {
      setError("Couldn't load your tabs. Is the backend running on port 5000?");
    } finally {
      setTabsLoading(false);
    }
  };

  const loadEntries = async (tabId) => {
    setLoading(true);
    setError("");
    try {
      const [expenseData, incomeData] = await Promise.all([
        fetchExpenses(tabId),
        fetchIncomes(tabId),
      ]);
      setExpenses(expenseData);
      setIncomes(incomeData);
    } catch (err) {
      setError("Couldn't reach the server. Is the backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  };

  const bumpTabCount = (tabId, field, delta) => {
    setTabs((prev) =>
      prev.map((t) => (t._id === tabId ? { ...t, [field]: Math.max(0, (t[field] || 0) + delta) } : t))
    );
  };

  // ---------- Tab handlers ----------

  const handleCreateTab = async (name) => {
    const created = await createTabApi(name);
    setTabs((prev) => [...prev, created]);
    setActiveTabId(created._id);
  };

  const handleRenameTab = async (id, name) => {
    const updated = await renameTabApi(id, name);
    setTabs((prev) => prev.map((t) => (t._id === id ? { ...t, ...updated } : t)));
  };

  const requestDeleteTab = (tab) => setDeleteTabTarget(tab);

  const handleDeleteTabConfirm = async () => {
    if (!deleteTabTarget) return;
    setDeletingTab(true);
    try {
      await deleteTabApi(deleteTabTarget._id);
      const remaining = tabs.filter((t) => t._id !== deleteTabTarget._id);
      setTabs(remaining);
      if (activeTabId === deleteTabTarget._id) {
        setActiveTabId(remaining[0]?._id || null);
      }
      setDeleteTabTarget(null);
    } catch (err) {
      setError("Couldn't delete that tab. Try again.");
    } finally {
      setDeletingTab(false);
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
        const created = await createExpense({ ...payload, tab: activeTabId });
        setExpenses((prev) => [created, ...prev]);
        bumpTabCount(activeTabId, "expenseCount", 1);
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
        const created = await createIncome({ ...payload, tab: activeTabId });
        setIncomes((prev) => [created, ...prev]);
        bumpTabCount(activeTabId, "incomeCount", 1);
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
        bumpTabCount(deleteTarget.item.tab || activeTabId, "expenseCount", -1);
      } else {
        await deleteIncome(deleteTarget.item._id);
        setIncomes((prev) => prev.filter((i) => i._id !== deleteTarget.item._id));
        bumpTabCount(deleteTarget.item.tab || activeTabId, "incomeCount", -1);
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

  const showEmptyTabsState = !tabsLoading && tabs.length === 0;

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ledger:sidebarCollapsed", next ? "1" : "0");
      }
      return next;
    });
  };

  return (
    <div className="app-layout">
      <Sidebar
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={setActiveTabId}
        onCreateTab={handleCreateTab}
        onRenameTab={handleRenameTab}
        onRequestDeleteTab={requestDeleteTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebarCollapsed}
      />

      <div className="app-main">
        <header className="app-header">
          <div className="app-header-inner">
            <div className="app-header-left">
              <button
                type="button"
                className="hamburger-button"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open tabs menu"
              >
                <span />
                <span />
                <span />
              </button>
              <div className="app-header-titles">
                <h1 className="app-title">Ledger</h1>
                <div className="app-subtitle">
                  {user ? `${user.name}'s expense register` : "Personal expense register"}
                  {activeTab ? ` · ${activeTab.name}` : ""}
                </div>
              </div>
            </div>
            <div className="app-header-right">
              {user?.role === "admin" && (
                <Link to="/admin" className="admin-panel-link" title="Admin panel">
                  <span className="admin-panel-link-icon" aria-hidden="true">
                    ⚙
                  </span>
                  <span className="admin-panel-link-label">Admin</span>
                </Link>
              )}
              <UserAvatar user={user} onClick={() => setSettingsOpen(true)} />
            </div>
          </div>
        </header>

        <div className="app-shell">
          {!showEmptyTabsState && <SummaryCard incomes={incomes} expenses={expenses} />}

          {tabsLoading && (
            <div className="status-line status-line-loading">
              <span className="mini-spinner" aria-hidden="true" />
              Loading your tabs…
            </div>
          )}
          {loading && !tabsLoading && (
            <div className="status-line status-line-loading">
              <span className="mini-spinner" aria-hidden="true" />
              Loading entries…
            </div>
          )}
          {error && <div className="status-line error">{error}</div>}

          {showEmptyTabsState && !error && (
            <div className="empty-tabs-state">
              <div className="empty-tabs-title">No tabs yet</div>
              <p>
                Tabs keep separate sets of income and expenses — one for personal spending,
                one for a side business, a trip, whatever you need.
              </p>
              <button
                type="button"
                className="stamp-button"
                onClick={() => setMobileSidebarOpen(true)}
              >
                + Create your first tab
              </button>
            </div>
          )}

          {!tabsLoading && !loading && !error && !showEmptyTabsState && (
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

          <ConfirmDeleteTabModal
            open={Boolean(deleteTabTarget)}
            tab={deleteTabTarget}
            onCancel={() => !deletingTab && setDeleteTabTarget(null)}
            onConfirm={handleDeleteTabConfirm}
            deleting={deletingTab}
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
      </div>
    </div>
  );
}
