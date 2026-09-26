export type Status = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';
export type DocumentType = 'Receipt' | 'Delivery' | 'Internal' | 'Adjustment';

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  stock: number;
  reorderPoint: number;
  warehouse: string;
  value: number;
};

export type Operation = {
  id: string;
  reference: string;
  type: DocumentType;
  status: Status;
  warehouse: string;
  category: string;
  partner: string;
  date: string;
  items: number;
  quantity: number;
  productId?: string;
  productName?: string;
  note?: string;
};

export type LedgerEntry = {
  id: string;
  date: string;
  reference: string;
  type: DocumentType;
  product: string;
  warehouse: string;
  change: number;
  balance: number;
  note: string;
};

export type Warehouse = {
  id: string;
  name: string;
  code: string;
  address: string;
  active: boolean;
};

export type Preferences = {
  defaultWarehouse: string;
  lowStockThreshold: number;
  autoReorder: boolean;
  requireValidation: boolean;
  darkMode: boolean;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
};

export type Workspace = {
  name: string;
  description: string;
};

export type Store = {
  products: Product[];
  operations: Operation[];
  ledger: LedgerEntry[];
  trash: LedgerEntry[];
  warehouses: Warehouse[];
  preferences: Preferences;
  users: UserProfile[];
  workspace: Workspace;
};

const initialProducts: Product[] = [
  { id: 'p1', name: 'Steel Rods', sku: 'STL-001', category: 'Raw materials', unit: 'kg', stock: 1240, reorderPoint: 500, warehouse: 'Main Warehouse', value: 18.4 },
  { id: 'p2', name: 'Oak Frames', sku: 'OAK-204', category: 'Finished goods', unit: 'pcs', stock: 86, reorderPoint: 100, warehouse: 'Production Floor', value: 42 },
  { id: 'p3', name: 'Industrial Paint', sku: 'PNT-118', category: 'Consumables', unit: 'l', stock: 54, reorderPoint: 80, warehouse: 'Main Warehouse', value: 12.8 },
  { id: 'p4', name: 'Aluminum Sheets', sku: 'ALU-305', category: 'Raw materials', unit: 'pcs', stock: 318, reorderPoint: 150, warehouse: 'Main Warehouse', value: 26.5 },
  { id: 'p5', name: 'Corner Brackets', sku: 'CBR-056', category: 'Components', unit: 'pcs', stock: 42, reorderPoint: 60, warehouse: 'Rack B', value: 4.2 },
  { id: 'p6', name: 'Safety Gloves', sku: 'SFT-010', category: 'Consumables', unit: 'pairs', stock: 240, reorderPoint: 120, warehouse: 'Main Warehouse', value: 3.1 },
];

const initialOperations: Operation[] = [
  { id: 'o1', reference: 'WH/IN/00042', type: 'Receipt', status: 'Waiting', warehouse: 'Main Warehouse', category: 'Raw materials', partner: 'Northstar Metals', date: '2026-09-26', items: 2, quantity: 180, productId: 'p1', productName: 'Steel Rods' },
  { id: 'o2', reference: 'WH/OUT/00038', type: 'Delivery', status: 'Ready', warehouse: 'Production Floor', category: 'Finished goods', partner: 'Oak & Co.', date: '2026-09-25', items: 1, quantity: 12, productId: 'p2', productName: 'Oak Frames' },
  { id: 'o3', reference: 'WH/MOVE/00017', type: 'Internal', status: 'Waiting', warehouse: 'Production Floor', category: 'Raw materials', partner: 'Main Warehouse', date: '2026-09-25', items: 1, quantity: 80, productId: 'p1', productName: 'Steel Rods' },
  { id: 'o4', reference: 'WH/ADJ/00009', type: 'Adjustment', status: 'Done', warehouse: 'Rack B', category: 'Components', partner: 'Cycle count', date: '2026-09-24', items: 1, quantity: -3, productId: 'p5', productName: 'Corner Brackets', note: 'Damaged stock' },
  { id: 'o5', reference: 'WH/IN/00041', type: 'Receipt', status: 'Done', warehouse: 'Main Warehouse', category: 'Consumables', partner: 'ProSupply', date: '2026-09-23', items: 1, quantity: 60, productId: 'p6', productName: 'Safety Gloves' },
];

const initialLedger: LedgerEntry[] = [
  { id: 'l1', date: '2026-09-24', reference: 'WH/ADJ/00009', type: 'Adjustment', product: 'Corner Brackets', warehouse: 'Rack B', change: -3, balance: 42, note: 'Damaged stock' },
  { id: 'l2', date: '2026-09-23', reference: 'WH/IN/00041', type: 'Receipt', product: 'Safety Gloves', warehouse: 'Main Warehouse', change: 60, balance: 240, note: 'Received from ProSupply' },
  { id: 'l3', date: '2026-09-21', reference: 'WH/OUT/00037', type: 'Delivery', product: 'Oak Frames', warehouse: 'Production Floor', change: -18, balance: 86, note: 'Customer shipment' },
  { id: 'l4', date: '2026-09-20', reference: 'WH/MOVE/00016', type: 'Internal', product: 'Steel Rods', warehouse: 'Production Floor', change: 120, balance: 1240, note: 'Main Warehouse → Production Floor' },
];

const initialWarehouses: Warehouse[] = [
  { id: 'w1', name: 'Main Warehouse', code: 'MW', address: '100 Industrial Pkwy, Northstar', active: true },
  { id: 'w2', name: 'Production Floor', code: 'PF', address: '200 Factory Rd, Northstar', active: true },
  { id: 'w3', name: 'Rack B', code: 'RB', address: '150 Storage Ln, Northstar', active: true },
];

const initialPreferences: Preferences = {
  defaultWarehouse: 'Main Warehouse',
  lowStockThreshold: 50,
  autoReorder: false,
  requireValidation: true,
  darkMode: false,
};

const initialUsers: UserProfile[] = [
  { id: 'u1', name: 'Alex Morgan', email: 'alex@northstar.co', role: 'Operations lead', avatar: 'AM' },
];

const initialWorkspace: Workspace = {
  name: 'Northstar Co.',
  description: 'Primary industrial workspace for Northstar manufacturing operations.',
};

const defaultStore: Store = {
  products: initialProducts,
  operations: initialOperations,
  ledger: initialLedger,
  trash: [],
  warehouses: initialWarehouses,
  preferences: initialPreferences,
  users: initialUsers,
  workspace: initialWorkspace,
};

export function getStore(): Store {
  const saved = localStorage.getItem('stocksense-store');
  if (!saved) return defaultStore;
  try {
    const parsed = JSON.parse(saved) as Partial<Store>;
    return {
      ...defaultStore,
      ...parsed,
      trash: parsed.trash ?? [],
      warehouses: parsed.warehouses ?? initialWarehouses,
      preferences: { ...initialPreferences, ...parsed.preferences },
      users: parsed.users ?? initialUsers,
      workspace: { ...initialWorkspace, ...parsed.workspace },
    };
  } catch {
    return defaultStore;
  }
}

export function saveStore(store: Store) {
  localStorage.setItem('stocksense-store', JSON.stringify(store));
}

export function validateOperation(store: Store, operationId: string): Store {
  const operation = store.operations.find((item) => item.id === operationId);
  if (!operation || operation.status === 'Done' || operation.status === 'Canceled') return store;
  const direction = operation.type === 'Delivery' ? -1 : 1;
  const change = operation.type === 'Adjustment' ? operation.quantity : operation.quantity * direction;
  const products = store.products.map((product) =>
    product.id === operation.productId ? { ...product, stock: product.stock + change } : product
  );
  const product = products.find((item) => item.id === operation.productId);
  const ledger: LedgerEntry[] = product
    ? [
        {
          id: `l${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          reference: operation.reference,
          type: operation.type,
          product: product.name,
          warehouse: operation.warehouse,
          change,
          balance: product.stock,
          note: operation.note ?? `${operation.type} validated`,
        },
        ...store.ledger,
      ]
    : store.ledger;
  return {
    ...store,
    products,
    ledger,
    operations: store.operations.map((item) =>
      item.id === operationId ? { ...item, status: 'Done' as Status } : item
    ),
  };
}

export function createOperation(
  type: DocumentType,
  product: Product,
  quantity: number,
  warehouse: string,
  partner: string,
  note: string
): Operation {
  const prefix = type === 'Receipt' ? 'IN' : type === 'Delivery' ? 'OUT' : type === 'Adjustment' ? 'ADJ' : 'MOVE';
  return {
    id: `o${Date.now()}`,
    reference: `WH/${prefix}/${String(Date.now()).slice(-5)}`,
    type,
    status: type === 'Adjustment' ? 'Ready' : 'Waiting',
    warehouse,
    category: product.category,
    partner,
    date: new Date().toISOString().slice(0, 10),
    items: 1,
    quantity,
    productId: product.id,
    productName: product.name,
    note,
  };
}

export function createProduct(data: Omit<Product, 'id'>): Product {
  return { ...data, id: `p${Date.now()}` };
}

export function deleteLedgerEntry(store: Store, entryId: string): Store {
  const entry = store.ledger.find((e) => e.id === entryId);
  if (!entry) return store;
  return {
    ...store,
    ledger: store.ledger.filter((e) => e.id !== entryId),
    trash: [{ ...entry }, ...store.trash],
  };
}

export function restoreLedgerEntry(store: Store, entryId: string): Store {
  const entry = store.trash.find((e) => e.id === entryId);
  if (!entry) return store;
  return {
    ...store,
    trash: store.trash.filter((e) => e.id !== entryId),
    ledger: [entry, ...store.ledger],
  };
}

export function permanentlyDeleteLedgerEntry(store: Store, entryId: string): Store {
  return {
    ...store,
    trash: store.trash.filter((e) => e.id !== entryId),
  };
}

export function exportLedgerCsv(ledger: LedgerEntry[]): string {
  const headers = ['Date', 'Reference', 'Type', 'Product', 'Warehouse', 'Change', 'Balance', 'Note'];
  const rows = ledger.map((e) =>
    [e.date, e.reference, e.type, e.product, e.warehouse, String(e.change), String(e.balance), e.note]
      .map((field) => `"${field.replace(/"/g, '""')}"`)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
