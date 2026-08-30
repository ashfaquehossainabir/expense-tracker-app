import { useEffect, useRef, useState } from "react";

function SidebarTabItem({ tab, active, collapsed, onSelect, onRename, onRequestDelete, onNeedExpand }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(tab.name);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEditing = (e) => {
    e.stopPropagation();
    if (collapsed) onNeedExpand?.();
    setValue(tab.name);
    setError("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setValue(tab.name);
    setError("");
  };

  const commit = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === tab.name) {
      cancelEditing();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onRename(tab._id, trimmed);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't rename this tab.");
    } finally {
      setSaving(false);
    }
  };

  const entryCount = (tab.expenseCount || 0) + (tab.incomeCount || 0);

  if (editing) {
    return (
      <div className="sidebar-tab sidebar-tab-editing">
        <input
          ref={inputRef}
          className="sidebar-tab-input"
          value={value}
          maxLength={40}
          disabled={saving}
          onChange={(e) => setValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") cancelEditing();
          }}
          onBlur={commit}
        />
        {error && <div className="sidebar-tab-error">{error}</div>}
      </div>
    );
  }

  return (
    <div
      className={`sidebar-tab ${active ? "active" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(tab._id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(tab._id);
        }
      }}
      title={tab.name}
    >
      <span className="sidebar-tab-icon" aria-hidden="true">
        {tab.name.trim().slice(0, 2).toUpperCase() || "?"}
      </span>
      <span className="sidebar-tab-name">{tab.name}</span>
      <span className="sidebar-tab-meta">
        <span className="sidebar-tab-count">{entryCount}</span>
        <span className="sidebar-tab-actions">
          <button
            type="button"
            className="icon-button"
            onClick={startEditing}
            aria-label={`Rename ${tab.name}`}
            title="Rename tab"
          >
            ✎
          </button>
          <button
            type="button"
            className="icon-button danger"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(tab);
            }}
            aria-label={`Delete ${tab.name}`}
            title="Delete tab"
          >
            ✕
          </button>
        </span>
      </span>
    </div>
  );
}

function AddTabRow({ onCreate, collapsed, onNeedExpand }) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const reset = () => {
    setAdding(false);
    setValue("");
    setError("");
  };

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      reset();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreate(trimmed);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create that tab.");
    } finally {
      setSaving(false);
    }
  };

  if (adding) {
    return (
      <div className="sidebar-add sidebar-add-editing">
        <input
          ref={inputRef}
          className="sidebar-tab-input"
          value={value}
          maxLength={40}
          disabled={saving}
          placeholder="Tab name…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") reset();
          }}
          onBlur={submit}
        />
        {error && <div className="sidebar-tab-error">{error}</div>}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="sidebar-add"
      onClick={() => {
        if (collapsed) onNeedExpand?.();
        setAdding(true);
      }}
      title="New tab"
    >
      <span className="sidebar-add-icon">+</span>
      <span className="sidebar-add-label"> New Tab</span>
    </button>
  );
}

export default function Sidebar({
  tabs,
  activeTabId,
  onSelectTab,
  onCreateTab,
  onRenameTab,
  onRequestDeleteTab,
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapsed,
}) {
  const expandIfCollapsed = () => {
    if (collapsed) onToggleCollapsed?.();
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""} ${collapsed ? "sidebar-collapsed" : ""}`}
        aria-label="Tabs"
      >
        <div className="sidebar-header">
          <span className="toolbar-label">Tabs</span>
          <button
            type="button"
            className="sidebar-collapse-toggle"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand tabs sidebar" : "Collapse tabs sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className="sidebar-collapse-icon">‹</span>
          </button>
          <button
            type="button"
            className="sidebar-close"
            onClick={onCloseMobile}
            aria-label="Close tabs menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-list">
          {tabs.map((tab) => (
            <SidebarTabItem
              key={tab._id}
              tab={tab}
              active={tab._id === activeTabId}
              collapsed={collapsed}
              onNeedExpand={expandIfCollapsed}
              onSelect={(id) => {
                onSelectTab(id);
                onCloseMobile();
              }}
              onRename={onRenameTab}
              onRequestDelete={onRequestDeleteTab}
            />
          ))}
        </nav>

        <AddTabRow onCreate={onCreateTab} collapsed={collapsed} onNeedExpand={expandIfCollapsed} />
      </aside>
    </>
  );
}
