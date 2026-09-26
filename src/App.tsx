import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Boxes, ChevronDown, ClipboardList,
  FilePlus2, Filter, LayoutDashboard, LogOut, Menu, Package, Plus, RefreshCcw, Search, Settings,
  SlidersHorizontal, Sparkles, UserCircle2, Warehouse as WarehouseIcon, X, Check, CircleHelp, Trash2, Download,
  Pencil, Edit2, RotateCcw, Users, Building2, HelpCircle, MessageCircleQuestion
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  createOperation, getStore, saveStore, validateOperation, createProduct, deleteLedgerEntry,
  restoreLedgerEntry, permanentlyDeleteLedgerEntry, exportLedgerCsv, downloadFile,
  type DocumentType, type Operation, type Product, type Store, type Warehouse, type UserProfile,
  type Preferences, type LedgerEntry
} from './data';

type Route = 'dashboard' | 'products' | 'receipts' | 'deliveries' | 'adjustments' | 'moves' | 'trash' | 'settings' | 'profile' | 'help';
type AuthView = 'signin' | 'reset';

const navGroups: { label?: string; items: { label: string; route: Route; icon: LucideIcon }[] }[] = [
  { items: [{ label: 'Dashboard', route: 'dashboard', icon: LayoutDashboard }, { label: 'Products', route: 'products', icon: Package }] },
  { label: 'Operations', items: [{ label: 'Receipts', route: 'receipts', icon: ArrowDownToLine }, { label: 'Delivery Orders', route: 'deliveries', icon: ArrowUpFromLine }, { label: 'Inventory Adjustment', route: 'adjustments', icon: SlidersHorizontal }, { label: 'Move History', route: 'moves', icon: ArrowLeftRight }, { label: 'Trash Bin', route: 'trash', icon: Trash2 }] },
  { label: 'Workspace', items: [{ label: 'Settings', route: 'settings', icon: Settings }, { label: 'Profile', route: 'profile', icon: UserCircle2 }, { label: 'Help Center', route: 'help', icon: CircleHelp }] },
];

const routeTitles: Record<Route, { title: string; eyebrow: string }> = {
  dashboard: { title: 'Inventory overview', eyebrow: 'Good morning, Alex' },
  products: { title: 'Products', eyebrow: 'Catalog & stock availability' },
  receipts: { title: 'Receipts', eyebrow: 'Incoming stock' },
  deliveries: { title: 'Delivery orders', eyebrow: 'Outgoing stock' },
  adjustments: { title: 'Inventory adjustment', eyebrow: 'Reconcile physical counts' },
  moves: { title: 'Move history', eyebrow: 'Internal transfers & ledger' },
  trash: { title: 'Trash Bin', eyebrow: 'Deleted ledger entries' },
  settings: { title: 'Warehouse settings', eyebrow: 'Workspace preferences' },
  profile: { title: 'My profile', eyebrow: 'Account & preferences' },
  help: { title: 'Help Center', eyebrow: 'Inventory flow guides' },
};

function App() {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem('stocksense-auth') === 'true');
  const [route, setRoute] = useState<Route>('dashboard');
  const [store, setStore] = useState<Store>(() => getStore());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(false);

  const persist = (next: Store) => { setStore(next); saveStore(next); };
  const logout = () => { localStorage.removeItem('stocksense-auth'); setAuthenticated(false); setRoute('dashboard'); };
  if (!authenticated) return <AuthScreen onSignIn={() => { localStorage.setItem('stocksense-auth', 'true'); setAuthenticated(true); }} />;

  const darkClass = store.preferences.darkMode ? 'dark-mode' : '';

  return <div className={`app-shell ${darkClass}`}>
    <Sidebar
      route={route}
      onNavigate={(next) => { setRoute(next); setMobileMenu(false); }}
      onLogout={logout}
      open={mobileMenu}
      onClose={() => setMobileMenu(false)}
      workspace={store.workspace}
      onEditWorkspace={() => setEditingWorkspace(true)}
    />
    <main className="main-content">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20} /></button>
        <div className="breadcrumbs"><span>Workspace</span><span className="slash">/</span><strong>{routeTitles[route].title}</strong></div>
        <div className="topbar-actions">
          <span className="sync-status"><span className="status-dot" /> All changes saved</span>
          <button className="help-button" onClick={() => setRoute('help')}><CircleHelp size={17} /> Help center</button>
          <div className="avatar">{store.users[0]?.avatar ?? 'AM'}</div>
        </div>
      </header>
      <div className="page-wrap">
        <PageHeader route={route} />
        {route === 'dashboard' && <Dashboard store={store} onNavigate={setRoute} />}
        {route === 'products' && <Products store={store} onChange={persist} />}
        {route === 'receipts' && <OperationsPage store={store} type="Receipt" onChange={persist} />}
        {route === 'deliveries' && <OperationsPage store={store} type="Delivery" onChange={persist} />}
        {route === 'adjustments' && <OperationsPage store={store} type="Adjustment" onChange={persist} />}
        {route === 'moves' && <Moves store={store} onChange={persist} />}
        {route === 'trash' && <TrashBin store={store} onChange={persist} />}
        {route === 'settings' && <SettingsPage store={store} onChange={persist} />}
        {route === 'profile' && <ProfilePage store={store} onChange={persist} onLogout={logout} />}
        {route === 'help' && <HelpCenter />}
      </div>
    </main>
    {editingWorkspace && (
      <WorkspaceModal
        workspace={store.workspace}
        onClose={() => setEditingWorkspace(false)}
        onSave={(ws) => { persist({ ...store, workspace: ws }); setEditingWorkspace(false); }}
      />
    )}
  </div>;
}

function AuthScreen({ onSignIn }: { onSignIn: () => void }) {
  const [view, setView] = useState<AuthView>('signin');
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (view === 'reset' && !sent) setSent(true); else onSignIn(); };
  return <div className="auth-page">
    <div className="auth-brand"><div className="brand-mark"><Boxes size={22} /></div><span>Stock<span>Sense</span></span></div>
    <div className="auth-card">
      <div className="auth-kicker"><Sparkles size={15} /> Warehouse intelligence</div>
      <h1>{view === 'signin' ? 'Welcome back' : 'Reset your password'}</h1>
      <p className="auth-copy">{view === 'signin' ? 'Sign in to keep your inventory moving with confidence.' : sent ? 'Your one-time code is ready. Enter it below to continue.' : 'We\'ll send a one-time code to your work email.'}</p>
      <form onSubmit={submit}>
        {view === 'signin' ? <>
          <label>Work email<input required type="email" placeholder="alex@company.com" defaultValue="alex@company.com" /></label>
          <label>Password<div className="password-field"><input required type="password" placeholder="Enter your password" defaultValue="stocksense" /><span>Show</span></div></label>
          <div className="form-row"><label className="check-label"><input type="checkbox" defaultChecked /> Remember me</label><button type="button" className="text-button" onClick={() => { setView('reset'); setSent(false); }}>Forgot password?</button></div>
          <button className="primary-button full" type="submit">Sign in <ArrowUpFromLine size={16} /></button>
        </> : <>
          {!sent ? <label>Work email<input required type="email" placeholder="alex@company.com" /></label> : <>
            <label>One-time code<input required inputMode="numeric" pattern="[0-9]{6}" placeholder="000 000" /></label>
            <label>New password<input required type="password" placeholder="Create a new password" /></label>
          </>}
          <button className="primary-button full" type="submit">{sent ? 'Continue to dashboard' : 'Send one-time code'} <ArrowUpFromLine size={16} /></button>
        </>}
      </form>
      <button className="back-link" onClick={() => { setView('signin'); setSent(false); }}>{view === 'reset' ? 'Back to sign in' : 'Use another account'}</button>
    </div>
    <p className="auth-footer">StockSense · Built for clear, controlled inventory.</p>
  </div>;
}

function Sidebar({ route, onNavigate, onLogout, open, onClose, workspace, onEditWorkspace }: {
  route: Route; onNavigate: (route: Route) => void; onLogout: () => void; open: boolean; onClose: () => void;
  workspace: { name: string; description: string }; onEditWorkspace: () => void;
}) {
  return <>
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-mark"><Boxes size={21} /></div>
        <span className="brand-name">Stock<span>Sense</span></span>
        <button className="icon-button close-menu mobile-only" onClick={onClose}><X size={19} /></button>
      </div>
      <div className="workspace-switch">
        <div className="workspace-icon"><WarehouseIcon size={17} /></div>
        <div><small>Workspace</small><strong>{workspace.name}</strong></div>
        <button className="icon-button workspace-edit-btn" onClick={onEditWorkspace} title="Edit workspace"><Edit2 size={13} /></button>
        <ChevronDown size={15} />
      </div>
      <nav className="side-nav">
        {navGroups.map((group) => <div className="nav-group" key={group.label ?? 'main'}>
          {group.label && <p className="nav-label">{group.label}</p>}
          {group.items.map((item) => <button key={item.route} className={`nav-item ${route === item.route ? 'active' : ''}`} onClick={() => onNavigate(item.route)}>
            <item.icon size={18} /><span>{item.label}</span>
            {item.route === 'dashboard' && <span className="nav-pill">4</span>}
          </button>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-card">
          <div className="upgrade-icon"><Sparkles size={16} /></div>
          <strong>Keep your stock sharp</strong>
          <p>Automate replenishment with Pro.</p>
          <button>Explore Pro <ArrowUpFromLine size={13} /></button>
        </div>
        <div className="user-menu">
          <div className="avatar">AM</div>
          <div><strong>Alex Morgan</strong><small>Operations lead</small></div>
          <button className="icon-button" onClick={onLogout} title="Log out"><LogOut size={16} /></button>
        </div>
      </div>
    </aside>
    {open && <button className="sidebar-overlay mobile-only" onClick={onClose} aria-label="Close menu" />}
  </>;
}

function PageHeader({ route }: { route: Route }) {
  const meta = routeTitles[route];
  return <div className="page-header"><div><p className="eyebrow">{meta.eyebrow}</p><h1>{meta.title}</h1></div></div>;
}

function Dashboard({ store, onNavigate }: { store: Store; onNavigate: (route: Route) => void }) {
  const [doc, setDoc] = useState('All documents'); const [status, setStatus] = useState('All statuses');
  const [warehouse, setWarehouse] = useState('All warehouses'); const [category, setCategory] = useState('All categories');
  const filtered = store.operations.filter((item) =>
    (doc === 'All documents' || item.type === doc) &&
    (status === 'All statuses' || item.status === status) &&
    (warehouse === 'All warehouses' || item.warehouse === warehouse) &&
    (category === 'All categories' || item.category === category)
  );
  const low = store.products.filter((item) => item.stock <= item.reorderPoint).length;
  const pendingReceipts = store.operations.filter((item) => item.type === 'Receipt' && item.status !== 'Done' && item.status !== 'Canceled').length;
  const pendingDeliveries = store.operations.filter((item) => item.type === 'Delivery' && item.status !== 'Done' && item.status !== 'Canceled').length;
  const transfers = store.operations.filter((item) => item.type === 'Internal' && item.status !== 'Done').length;
  const kpis = [
    { label: 'Total products', value: store.products.length, detail: 'Across all warehouses', icon: Package, tone: 'blue' },
    { label: 'Low stock', value: low, detail: low ? 'Needs your attention' : 'All levels healthy', icon: AlertTriangle, tone: 'orange' },
    { label: 'Pending receipts', value: pendingReceipts, detail: 'Awaiting validation', icon: ArrowDownToLine, tone: 'green' },
    { label: 'Pending deliveries', value: pendingDeliveries, detail: 'Ready to process', icon: ArrowUpFromLine, tone: 'red' },
    { label: 'Internal transfers', value: transfers, detail: 'Scheduled movements', icon: ArrowLeftRight, tone: 'teal' },
  ];
  return <>
    <div className="kpi-grid">{kpis.map((kpi) => <div className="kpi-card" key={kpi.label}><div className={`kpi-icon ${kpi.tone}`}><kpi.icon size={19} /></div><div><p>{kpi.label}</p><strong>{kpi.value}</strong><span>{kpi.detail}</span></div></div>)}</div>
    <section className="section-card operations-card">
      <div className="card-heading"><div><h2>Activity overview</h2><p>Track every movement across your inventory.</p></div><button className="secondary-button" onClick={() => onNavigate('moves')}>View ledger <ArrowUpFromLine size={15} /></button></div>
      <div className="filter-bar"><Filter size={16} /><Select value={doc} onChange={setDoc} options={['All documents', 'Receipt', 'Delivery', 'Internal', 'Adjustment']} /><Select value={status} onChange={setStatus} options={['All statuses', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled']} /><Select value={warehouse} onChange={setWarehouse} options={['All warehouses', 'Main Warehouse', 'Production Floor', 'Rack B']} /><Select value={category} onChange={setCategory} options={['All categories', 'Raw materials', 'Finished goods', 'Consumables', 'Components']} /></div>
      <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Type</th><th>Partner</th><th>Warehouse</th><th>Date</th><th>Status</th></tr></thead><tbody>{filtered.slice(0, 5).map((item) => <tr key={item.id}><td><strong>{item.reference}</strong><small>{item.items} item{item.items !== 1 ? 's' : ''}</small></td><td><TypeBadge type={item.type} /></td><td>{item.partner}</td><td>{item.warehouse}</td><td>{formatDate(item.date)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState text="No operations match these filters." />}</div>
    </section>
    <div className="lower-grid">
      <section className="section-card low-stock-card">
        <div className="card-heading"><div><h2>Stock watch</h2><p>Products below their reorder point.</p></div><button className="icon-text-button" onClick={() => onNavigate('products')}>See all <ArrowUpFromLine size={14} /></button></div>
        {store.products.filter((item) => item.stock <= item.reorderPoint).map((product) => <div className="stock-row" key={product.id}><div className="product-avatar">{product.name.slice(0, 2).toUpperCase()}</div><div className="stock-info"><strong>{product.name}</strong><small>{product.sku} · {product.warehouse}</small></div><div className="stock-number"><strong>{product.stock} {product.unit}</strong><span>of {product.reorderPoint} min.</span></div><div className="progress"><span style={{ width: `${Math.min(100, (product.stock / product.reorderPoint) * 100)}%` }} /></div></div>)}
        {low === 0 && <EmptyState text="All products are above their reorder point." />}
      </section>
      <section className="section-card warehouse-card">
        <div className="card-heading"><div><h2>Warehouse pulse</h2><p>Stock value by location.</p></div><WarehouseIcon size={20} className="muted-icon" /></div>
        {store.warehouses.map((wh) => { const items = store.products.filter((item) => item.warehouse === wh.name); const value = items.reduce((sum, item) => sum + item.stock * item.value, 0); return <div className="warehouse-row" key={wh.id}><div className="warehouse-title"><span className="warehouse-dot" /><strong>{wh.name}</strong><span>{items.length} products</span></div><strong>${value.toLocaleString()}</strong><div className="warehouse-bar"><span style={{ width: `${Math.min(100, value / 250)}%` }} /></div></div>; })}
      </section>
    </div>
  </>;
}

function Products({ store, onChange }: { store: Store; onChange: (store: Store) => void }) {
  const [query, setQuery] = useState(''); const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null); const [category, setCategory] = useState('All categories');
  const products = store.products.filter((item) =>
    (item.name.toLowerCase().includes(query.toLowerCase()) || item.sku.toLowerCase().includes(query.toLowerCase())) &&
    (category === 'All categories' || item.category === category)
  );
  return <>
    <div className="toolbar">
      <div className="search-input"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or SKU" /></div>
      <Select value={category} onChange={setCategory} options={['All categories', 'Raw materials', 'Finished goods', 'Consumables', 'Components']} />
      <button className="secondary-button"><Filter size={16} /> Filters</button>
      <button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> Add product</button>
    </div>
    <section className="section-card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>On hand</th><th>Reorder point</th><th>Warehouse</th><th>Stock value</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((product) => <tr key={product.id}>
              <td><div className="table-product"><div className="product-avatar">{product.name.slice(0, 2).toUpperCase()}</div><div><strong>{product.name}</strong><small>{product.sku} · per {product.unit}</small></div></div></td>
              <td>{product.category}</td>
              <td><strong>{product.stock.toLocaleString()} {product.unit}</strong>{product.stock <= product.reorderPoint && <span className="inline-alert">Low</span>}</td>
              <td>{product.reorderPoint} {product.unit}</td>
              <td>{product.warehouse}</td>
              <td>${(product.stock * product.value).toLocaleString()}</td>
              <td><div className="row-actions">
                <button className="small-action edit-action" onClick={() => setEditing(product)}><Pencil size={13} /> Edit</button>
                <button className="small-action delete-action" onClick={() => { if (confirm(`Delete ${product.name}?`)) onChange({ ...store, products: store.products.filter((p) => p.id !== product.id) }); }}><Trash2 size={13} /> Delete</button>
              </div></td>
            </tr>)}
          </tbody>
        </table>
        {products.length === 0 && <EmptyState text="No products found." />}
      </div>
    </section>
    {showForm && <ProductModal onClose={() => setShowForm(false)} onSave={(product) => { onChange({ ...store, products: [...store.products, product] }); setShowForm(false); }} />}
    {editing && <ProductModal product={editing} onClose={() => setEditing(null)} onSave={(product) => { onChange({ ...store, products: store.products.map((p) => p.id === product.id ? product : p) }); setEditing(null); }} />}
  </>;
}

function OperationsPage({ store, type, onChange }: { store: Store; type: DocumentType; onChange: (store: Store) => void }) {
  const [showForm, setShowForm] = useState(false); const [filter, setFilter] = useState('All statuses'); const [selected, setSelected] = useState<Operation | null>(null);
  const operations = store.operations.filter((item) => item.type === type && (filter === 'All statuses' || item.status === filter));
  const label = type === 'Receipt' ? 'receipt' : type === 'Delivery' ? 'delivery' : 'adjustment';
  return <>
    <div className="toolbar">
      <div className="toolbar-summary"><span className="summary-dot" /> {operations.length} {label}{operations.length !== 1 ? 's' : ''} in this workspace</div>
      <Select value={filter} onChange={setFilter} options={['All statuses', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled']} />
      <button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> New {label}</button>
    </div>
    <section className="section-card">
      <div className="table-wrap">
        <table>
          <thead><tr><th>Reference</th><th>Product</th><th>Quantity</th><th>Partner / note</th><th>Date</th><th>Status</th><th /></tr></thead>
          <tbody>
            {operations.map((item) => <tr key={item.id}>
              <td><strong>{item.reference}</strong><small>{item.warehouse}</small></td>
              <td>{item.productName}</td>
              <td><strong>{item.quantity > 0 ? '+' : ''}{item.quantity} {store.products.find((p) => p.id === item.productId)?.unit}</strong></td>
              <td>{item.partner}</td>
              <td>{formatDate(item.date)}</td>
              <td><StatusBadge status={item.status} /></td>
              <td>{item.status !== 'Done' && item.status !== 'Canceled' && <button className="small-action" onClick={() => setSelected(item)}><Check size={14} /> Validate</button>}</td>
            </tr>)}
          </tbody>
        </table>
        {operations.length === 0 && <EmptyState text={`No ${label}s found.`} />}
      </div>
    </section>
    {showForm && <OperationModal type={type} products={store.products} onClose={() => setShowForm(false)} onSave={(operation) => { onChange({ ...store, operations: [operation, ...store.operations] }); setShowForm(false); }} />}
    {selected && <ConfirmModal operation={selected} onClose={() => setSelected(null)} onConfirm={() => { onChange(validateOperation(store, selected.id)); setSelected(null); }} />}
  </>;
}

function Moves({ store, onChange }: { store: Store; onChange: (store: Store) => void }) {
  const [reloadKey, setReloadKey] = useState(0);
  const ledger = useMemo(() => store.ledger, [store.ledger, reloadKey]);

  const handleRefresh = () => { setReloadKey((k) => k + 1); };

  const handleDelete = (entry: LedgerEntry) => {
    if (confirm(`Move "${entry.reference}" to Trash Bin?`)) {
      onChange(deleteLedgerEntry(store, entry.id));
    }
  };

  const handleDownload = () => {
    const csv = exportLedgerCsv(ledger);
    downloadFile(`stock-ledger-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return <section className="section-card">
    <div className="card-heading">
      <div><h2>Stock ledger</h2><p>A complete, chronological record of inventory changes.</p></div>
      <div className="card-actions">
        <button className="secondary-button" onClick={handleDownload}><Download size={15} /> Download History</button>
        <button className="secondary-button" onClick={handleRefresh}><RefreshCcw size={15} /> Refresh</button>
      </div>
    </div>
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Reference</th><th>Product</th><th>Warehouse</th><th>Movement</th><th>Balance</th><th>Note</th><th>Actions</th></tr></thead>
        <tbody>
          {ledger.map((entry) => <tr key={entry.id}>
            <td>{formatDate(entry.date)}</td>
            <td><strong>{entry.reference}</strong></td>
            <td>{entry.product}</td>
            <td>{entry.warehouse}</td>
            <td><span className={entry.change > 0 ? 'positive-change' : 'negative-change'}>{entry.change > 0 ? '+' : ''}{entry.change}</span><TypeBadge type={entry.type} /></td>
            <td><strong>{entry.balance}</strong></td>
            <td>{entry.note}</td>
            <td><button className="small-action delete-action" onClick={() => handleDelete(entry)}><Trash2 size={13} /> Delete</button></td>
          </tr>)}
        </tbody>
      </table>
      {ledger.length === 0 && <EmptyState text="No ledger entries." />}
    </div>
  </section>;
}

function TrashBin({ store, onChange }: { store: Store; onChange: (store: Store) => void }) {
  return <section className="section-card">
    <div className="card-heading">
      <div><h2>Trash Bin</h2><p>Deleted ledger entries. Restore or permanently delete.</p></div>
      <span className="trash-count">{store.trash.length} item{store.trash.length !== 1 ? 's' : ''}</span>
    </div>
    <div className="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Reference</th><th>Product</th><th>Warehouse</th><th>Movement</th><th>Balance</th><th>Note</th><th>Actions</th></tr></thead>
        <tbody>
          {store.trash.map((entry) => <tr key={entry.id} className="trash-row">
            <td>{formatDate(entry.date)}</td>
            <td><strong>{entry.reference}</strong></td>
            <td>{entry.product}</td>
            <td>{entry.warehouse}</td>
            <td><span className={entry.change > 0 ? 'positive-change' : 'negative-change'}>{entry.change > 0 ? '+' : ''}{entry.change}</span></td>
            <td><strong>{entry.balance}</strong></td>
            <td>{entry.note}</td>
            <td><div className="row-actions">
              <button className="small-action restore-action" onClick={() => onChange(restoreLedgerEntry(store, entry.id))}><RotateCcw size={13} /> Restore</button>
              <button className="small-action delete-action" onClick={() => { if (confirm('Permanently delete this entry? This cannot be undone.')) onChange(permanentlyDeleteLedgerEntry(store, entry.id)); }}><Trash2 size={13} /> Delete</button>
            </div></td>
          </tr>)}
        </tbody>
      </table>
      {store.trash.length === 0 && <EmptyState text="Trash bin is empty." />}
    </div>
  </section>;
}

function SettingsPage({ store, onChange }: { store: Store; onChange: (store: Store) => void }) {
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>(store.preferences);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSavePrefs = () => {
    onChange({ ...store, preferences: prefs });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const warehouseNames = store.warehouses.map((w) => w.name);

  return <div className="settings-grid">
    <section className="section-card settings-list">
      <div className="card-heading">
        <div><h2>Warehouses</h2><p>Manage locations and stock availability.</p></div>
        <button className="primary-button" onClick={() => setShowWarehouseForm(true)}><Plus size={16} /> Add warehouse</button>
      </div>
      {store.warehouses.map((wh) => <div className="setting-row" key={wh.id}>
        <div className="setting-icon"><WarehouseIcon size={18} /></div>
        <div><strong>{wh.name}</strong><small>{wh.code} · {wh.address}</small></div>
        <span className="active-label">{wh.active ? 'Active' : 'Inactive'}</span>
      </div>)}
    </section>
    <section className="section-card settings-form">
      <div className="card-heading"><div><h2>Inventory preferences</h2><p>Set default behavior for your workspace.</p></div></div>
      <label>Default warehouse
        <Select value={prefs.defaultWarehouse} onChange={(v) => setPrefs({ ...prefs, defaultWarehouse: v })} options={warehouseNames} />
      </label>
      <label>Low stock threshold (units)
        <input type="number" min="0" value={prefs.lowStockThreshold} onChange={(e) => setPrefs({ ...prefs, lowStockThreshold: Number(e.target.value) })} />
      </label>
      <label className="toggle-row">
        <span><strong>Require validation</strong><small>Confirm every receipt and delivery before posting stock.</small></span>
        <button type="button" className={`toggle ${prefs.requireValidation ? 'active' : ''}`} onClick={() => setPrefs({ ...prefs, requireValidation: !prefs.requireValidation })}><span /></button>
      </label>
      <label className="toggle-row">
        <span><strong>Auto-reorder</strong><small>Automatically create purchase orders when stock drops below threshold.</small></span>
        <button type="button" className={`toggle ${prefs.autoReorder ? 'active' : ''}`} onClick={() => setPrefs({ ...prefs, autoReorder: !prefs.autoReorder })}><span /></button>
      </label>
      <label className="toggle-row">
        <span><strong>Dark mode</strong><small>Switch the workspace to a dark color theme.</small></span>
        <button type="button" className={`toggle ${prefs.darkMode ? 'active' : ''}`} onClick={() => setPrefs({ ...prefs, darkMode: !prefs.darkMode })}><span /></button>
      </label>
      <div className="prefs-save-row">
        <button className="primary-button" onClick={handleSavePrefs}>Save preferences</button>
        {savedMsg && <span className="saved-msg"><Check size={14} /> Saved</span>}
      </div>
    </section>
    {showWarehouseForm && <WarehouseFormModal
      onClose={() => setShowWarehouseForm(false)}
      onSave={(wh) => { onChange({ ...store, warehouses: [...store.warehouses, wh] }); setShowWarehouseForm(false); }}
    />}
  </div>;
}

function ProfilePage({ store, onChange, onLogout }: { store: Store; onChange: (store: Store) => void; onLogout: () => void }) {
  const [editing, setEditing] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const currentUser = store.users[0] ?? { id: 'u1', name: 'Alex Morgan', email: 'alex@northstar.co', role: 'Operations lead', avatar: 'AM' };

  return <div className="profile-grid">
    <section className="section-card profile-card">
      <div className="profile-hero">
        <div className="profile-avatar">{currentUser.avatar}</div>
        <div><h2>{currentUser.name}</h2><p>{currentUser.role} · {store.workspace.name}</p></div>
        <button className="secondary-button" onClick={() => setEditing(true)}><Edit2 size={15} /> Edit profile</button>
      </div>
      <div className="profile-details">
        <label>Full name<input value={currentUser.name} readOnly /></label>
        <label>Work email<input value={currentUser.email} readOnly /></label>
        <label>Role<input value={currentUser.role} readOnly /></label>
      </div>
    </section>
    <div className="profile-side">
      <section className="section-card danger-card">
        <h2>Sign out</h2>
        <p>End this session on the current device.</p>
        <button className="secondary-button" onClick={onLogout}><LogOut size={16} /> Log out</button>
      </section>
      <section className="section-card users-card">
        <div className="card-heading">
          <div><h2>Team members</h2><p>Manage additional user accounts.</p></div>
          <button className="primary-button" onClick={() => setShowAddUser(true)}><Plus size={15} /> Add user</button>
        </div>
        <div className="users-list">
          {store.users.map((user) => <div className="user-row" key={user.id}>
            <div className="profile-avatar small">{user.avatar}</div>
            <div><strong>{user.name}</strong><small>{user.role}</small></div>
            {store.users.length > 1 && <button className="small-action delete-action" onClick={() => onChange({ ...store, users: store.users.filter((u) => u.id !== user.id) })}><Trash2 size={13} /></button>}
          </div>)}
        </div>
      </section>
    </div>
    {editing && <EditProfileModal user={currentUser} onClose={() => setEditing(false)} onSave={(updated) => { onChange({ ...store, users: store.users.map((u) => u.id === updated.id ? updated : u) }); setEditing(false); }} />}
    {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onSave={(user) => { onChange({ ...store, users: [...store.users, user] }); setShowAddUser(false); }} />}
  </div>;
}

function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const steps = [
    { icon: ArrowDownToLine, title: 'Step 1 — Receive stock', content: 'Create a Receipt to bring incoming stock into your warehouse. Validate it to update the on-hand quantity and post a ledger entry.' },
    { icon: Package, title: 'Step 2 — Track products', content: 'Monitor product levels across warehouses. Watch for low-stock alerts when inventory drops below the reorder point.' },
    { icon: ArrowLeftRight, title: 'Step 3 — Move inventory', content: 'Transfer stock between warehouses using internal moves. Every movement is logged in the stock ledger for full traceability.' },
    { icon: ArrowUpFromLine, title: 'Step 4 — Deliver orders', content: 'Create delivery orders to ship finished goods to customers. Validating a delivery decreases stock and records the outgoing movement.' },
  ];
  return <div className="help-center">
    <section className="section-card help-hero-card">
      <div className="help-hero">
        <div className="help-hero-icon"><MessageCircleQuestion size={28} /></div>
        <div><h2>Inventory Flow Guide</h2><p>Learn the 4-step inventory cycle in StockSense — from receiving stock to delivering orders.</p></div>
      </div>
    </section>
    <div className="help-steps-grid">
      {steps.map((step, index) => <div className="help-step-card" key={index}>
        <div className="help-step-icon"><step.icon size={20} /></div>
        <strong>{step.title}</strong>
        <p>{step.content}</p>
      </div>)}
    </div>
    <section className="section-card faq-card">
      <div className="card-heading"><div><h2>Frequently asked questions</h2><p>Quick answers to common inventory questions.</p></div></div>
      <div className="faq-list">
        {[
          { q: 'How do I receive new stock?', a: 'Navigate to Receipts, click "New receipt", select a product, enter the quantity and supplier, then validate to post the stock.' },
          { q: 'What happens when stock is low?', a: 'Products at or below their reorder point appear in the Stock Watch on the dashboard. Enable auto-reorder in Settings to trigger purchase orders automatically.' },
          { q: 'How do I transfer stock between warehouses?', a: 'Use Inventory Adjustment or create an Internal move. Each transfer is recorded in the Move History ledger with full traceability.' },
          { q: 'Can I recover deleted ledger entries?', a: 'Yes. Deleting a ledger entry moves it to the Trash Bin. From there you can restore it or permanently delete it.' },
          { q: 'How do I export my ledger?', a: 'Go to Move History and click "Download History" to export all ledger entries as a CSV file.' },
        ].map((faq, index) => <div className="faq-item" key={index}>
          <button className={`faq-question ${openFaq === index ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
            <HelpCircle size={17} /><span>{faq.q}</span><ChevronDown size={16} className="faq-chevron" />
          </button>
          {openFaq === index && <div className="faq-answer"><p>{faq.a}</p></div>}
        </div>)}
      </div>
    </section>
  </div>;
}

function ProductModal({ product, onClose, onSave }: { product?: Product; onClose: () => void; onSave: (product: Product) => void }) {
  const [form, setForm] = useState({
    name: product?.name ?? '', sku: product?.sku ?? '', category: product?.category ?? 'Raw materials',
    unit: product?.unit ?? 'pcs', stock: String(product?.stock ?? '0'), reorderPoint: String(product?.reorderPoint ?? '10'),
    warehouse: product?.warehouse ?? 'Main Warehouse',
  });
  const update = (key: keyof typeof form, value: string) => setForm({ ...form, [key]: value });
  return <Modal title={product ? 'Edit product' : 'Add a product'} onClose={onClose}>
    <form onSubmit={(e) => {
      e.preventDefault();
      const data: Product = {
        id: product?.id ?? `p${Date.now()}`, name: form.name, sku: form.sku, category: form.category,
        unit: form.unit, stock: Number(form.stock), reorderPoint: Number(form.reorderPoint),
        warehouse: form.warehouse, value: product?.value ?? 10,
      };
      onSave(data);
    }}>
      <div className="form-grid">
        <label>Product name<input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Steel Rods" /></label>
        <label>SKU / code<input required value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="e.g. STL-001" /></label>
        <label>Category<Select value={form.category} onChange={(v) => update('category', v)} options={['Raw materials', 'Finished goods', 'Consumables', 'Components']} /></label>
        <label>Unit<input required value={form.unit} onChange={(e) => update('unit', e.target.value)} /></label>
        <label>Initial stock<input type="number" min="0" required value={form.stock} onChange={(e) => update('stock', e.target.value)} /></label>
        <label>Reorder point<input type="number" min="0" required value={form.reorderPoint} onChange={(e) => update('reorderPoint', e.target.value)} /></label>
      </div>
      <label>Warehouse<Select value={form.warehouse} onChange={(v) => update('warehouse', v)} options={['Main Warehouse', 'Production Floor', 'Rack B']} /></label>
      <ModalActions onClose={onClose} />
    </form>
  </Modal>;
}

function OperationModal({ type, products, onClose, onSave }: { type: DocumentType; products: Product[]; onClose: () => void; onSave: (operation: Operation) => void }) {
  const [productId, setProductId] = useState(products[0]?.id ?? '');
  const [quantity, setQuantity] = useState('1');
  const [warehouse, setWarehouse] = useState('Main Warehouse');
  const [partner, setPartner] = useState(type === 'Adjustment' ? 'Cycle count' : '');
  const [note, setNote] = useState('');
  const product = products.find((item) => item.id === productId) ?? products[0];
  return <Modal title={`New ${type === 'Receipt' ? 'receipt' : type === 'Delivery' ? 'delivery order' : 'inventory adjustment'}`} onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); if (product) onSave(createOperation(type, product, Number(quantity), warehouse, partner, note)); }}>
      <label>Product<Select value={productId} onChange={setProductId} options={products.map((item) => item.id)} labels={products.map((item) => item.name)} /></label>
      <div className="form-grid">
        <label>Quantity<input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
        <label>Warehouse<Select value={warehouse} onChange={setWarehouse} options={['Main Warehouse', 'Production Floor', 'Rack B']} /></label>
      </div>
      <label>{type === 'Adjustment' ? 'Reason' : type === 'Receipt' ? 'Supplier' : 'Customer'}<input required value={partner} onChange={(e) => setPartner(e.target.value)} placeholder={type === 'Receipt' ? 'Supplier name' : 'Company or reason'} /></label>
      <label>Note <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the ledger" /></label>
      <div className="modal-callout"><ClipboardList size={17} /><span>{type === 'Receipt' ? 'Validating this receipt will increase stock.' : type === 'Delivery' ? 'Validating this order will decrease stock.' : 'Validating this adjustment will recalculate the ledger.'}</span></div>
      <ModalActions onClose={onClose} />
    </form>
  </Modal>;
}

function ConfirmModal({ operation, onClose, onConfirm }: { operation: Operation; onClose: () => void; onConfirm: () => void }) {
  return <Modal title="Validate operation" onClose={onClose}>
    <div className="confirm-content">
      <div className="confirm-icon"><Check size={23} /></div>
      <h3>Post {operation.reference} to stock?</h3>
      <p>This will update the stock balance for <strong>{operation.productName}</strong> and add a new entry to the ledger. This action cannot be undone.</p>
    </div>
    <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={onConfirm}>Validate stock <Check size={16} /></button></div>
  </Modal>;
}

function WarehouseFormModal({ onClose, onSave }: { onClose: () => void; onSave: (wh: Warehouse) => void }) {
  const [form, setForm] = useState({ name: '', code: '', address: '' });
  return <Modal title="Add warehouse" onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); onSave({ id: `w${Date.now()}`, name: form.name, code: form.code, address: form.address, active: true }); }}>
      <label>Warehouse name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cold Storage" /></label>
      <label>Code<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS" /></label>
      <label>Address<input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city" /></label>
      <ModalActions onClose={onClose} />
    </form>
  </Modal>;
}

function WorkspaceModal({ workspace, onClose, onSave }: { workspace: { name: string; description: string }; onClose: () => void; onSave: (ws: { name: string; description: string }) => void }) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description);
  return <Modal title="Edit workspace" onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); onSave({ name, description }); }}>
      <label>Workspace name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Description<textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Workspace description" /></label>
      <ModalActions onClose={onClose} />
    </form>
  </Modal>;
}

function EditProfileModal({ user, onClose, onSave }: { user: UserProfile; onClose: () => void; onSave: (user: UserProfile) => void }) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [avatar, setAvatar] = useState(user.avatar);
  return <Modal title="Edit profile" onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...user, name, role, avatar: avatar || name.slice(0, 2).toUpperCase() }); }}>
      <div className="profile-avatar-preview"><div className="profile-avatar large">{avatar || name.slice(0, 2).toUpperCase()}</div></div>
      <label>Profile image (initials)<input value={avatar} onChange={(e) => setAvatar(e.target.value.slice(0, 2).toUpperCase())} placeholder="e.g. AM" maxLength={2} /></label>
      <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} /></label>
      <label>Role<input required value={role} onChange={(e) => setRole(e.target.value)} /></label>
      <ModalActions onClose={onClose} />
    </form>
  </Modal>;
}

function AddUserModal({ onClose, onSave }: { onClose: () => void; onSave: (user: UserProfile) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Team member');
  return <Modal title="Add team member" onClose={onClose}>
    <form onSubmit={(e) => { e.preventDefault(); onSave({ id: `u${Date.now()}`, name, email, role, avatar: name.slice(0, 2).toUpperCase() }); }}>
      <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Lee" /></label>
      <label>Work email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. jordan@northstar.co" /></label>
      <label>Role<Select value={role} onChange={setRole} options={['Team member', 'Operations lead', 'Warehouse manager', 'Analyst']} /></label>
      <ModalActions onClose={onClose} />
    </form>
  </Modal>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop"><div className="modal"><div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={19} /></button></div>{children}</div></div>;
}
function ModalActions({ onClose }: { onClose: () => void }) {
  return <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save <Check size={16} /></button></div>;
}
function Select({ value, onChange, options, labels }: { value: string; onChange: (value: string) => void; options: string[]; labels?: string[] }) {
  return <div className="select-wrap"><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option, index) => <option key={option} value={option}>{labels?.[index] ?? option}</option>)}</select><ChevronDown size={14} /></div>;
}
function TypeBadge({ type }: { type: DocumentType }) { return <span className={`type-badge type-${type.toLowerCase()}`}>{type}</span>; }
function StatusBadge({ status }: { status: string }) { return <span className={`status-badge status-${status.toLowerCase()}`}><span />{status}</span>; }
function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Package size={22} /><p>{text}</p></div>; }
function formatDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

export default App;
