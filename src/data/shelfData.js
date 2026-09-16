export const shelfKpis = {
  totalShelves: 48,
  healthyShelves: 32,
  lowStockShelves: 10,
  emptyShelves: 6,
};

export const shelfStatusBreakdown = [
  { name: 'Healthy', value: 32, color: '#10B981' },
  { name: 'Low Stock', value: 10, color: '#F59E0B' },
  { name: 'Empty', value: 6, color: '#EF4444' },
];

export const shelfInventoryTable = [
  { id: 'sh-a1', code: 'A1', aisle: 'Aisle 1', zone: 'Beverages', product: 'Coca Cola 500ml', shelfStatus: 'Low', stock: 12, reorderLevel: 50, warehouseStock: 86, lastChecked: '2 min ago' },
  { id: 'sh-a2', code: 'A2', aisle: 'Aisle 1', zone: 'Beverages', product: 'Pepsi Can 330ml', shelfStatus: 'Healthy', stock: 46, reorderLevel: 40, warehouseStock: 120, lastChecked: '3 min ago' },
  { id: 'sh-b1', code: 'B1', aisle: 'Aisle 2', zone: 'Snacks', product: 'Lays Classic Chips', shelfStatus: 'Empty', stock: 0, reorderLevel: 40, warehouseStock: 42, lastChecked: '4 min ago' },
  { id: 'sh-c2', code: 'C2', aisle: 'Aisle 3', zone: 'Personal Care', product: 'Dove Soap 100g', shelfStatus: 'Healthy', stock: 72, reorderLevel: 30, warehouseStock: 210, lastChecked: '5 min ago' },
  { id: 'sh-d1', code: 'D1', aisle: 'Aisle 4', zone: 'Food', product: 'Maggi 2-Min Noodles', shelfStatus: 'Low', stock: 15, reorderLevel: 30, warehouseStock: 95, lastChecked: '6 min ago' },
  { id: 'sh-b2', code: 'B2', aisle: 'Aisle 2', zone: 'Snacks', product: 'Parle-G Biscuits', shelfStatus: 'Empty', stock: 0, reorderLevel: 35, warehouseStock: 0, lastChecked: '1 min ago' },
];

export const visualShelfRackItems = [
  { row: 'Top Rack', code: 'A1', product: 'Coca Cola 500ml', level: 'Low (12/50)', status: 'low' },
  { row: 'Top Rack', code: 'A2', product: 'Pepsi Can 330ml', level: 'Healthy (46/40)', status: 'healthy' },
  { row: 'Top Rack', code: 'A3', product: 'Sprite 500ml', level: 'Healthy (38/30)', status: 'healthy' },
  { row: 'Middle Rack', code: 'B1', product: 'Lays Classic', level: 'Empty (0/40)', status: 'empty' },
  { row: 'Middle Rack', code: 'B2', product: 'Maggi Noodles', level: 'Low (15/30)', status: 'low' },
  { row: 'Middle Rack', code: 'B3', product: 'Parle-G Biscuits', level: 'Empty (0/35)', status: 'empty' },
];

export const shelfActivityEvents = [
  { time: '06:12 PM', text: 'High customer interaction detected at Beverage Shelf A1 (18 pickups)', type: 'interaction' },
  { time: '06:20 PM', text: 'Shelf stock dropped below threshold for Coca Cola 500ml (12 left)', type: 'warning' },
  { time: '06:31 PM', text: 'Empty shelf event triggered for Lays Classic Chips (Aisle 2, B1)', type: 'alert' },
  { time: '06:45 PM', text: 'Restocking task assigned to Floor Agent — 40 units Lays Classic', type: 'task' },
];

export const shelfVsInventoryScenarios = [
  {
    id: 1,
    title: 'Scenario 1: Shelf Low, Warehouse Stock Available',
    shelfStatus: 'Low Stock (12 units)',
    storeInventory: '12 units',
    warehouseStock: '86 units',
    result: 'Replenishment Available',
    recommendation: 'Move 40 units from Warehouse to Store Shelf A1 immediately.',
    actionLabel: 'Replenish Shelf',
    badgeVariant: 'emerald',
  },
  {
    id: 2,
    title: 'Scenario 2: Shelf Empty, Store & Warehouse Depleted',
    shelfStatus: 'Empty (0 units)',
    storeInventory: '0 units',
    warehouseStock: '0 units',
    result: 'Stockout Risk',
    recommendation: 'Create urgent Purchase Order to supplier for Parle-G Biscuits.',
    actionLabel: 'Create Reorder',
    badgeVariant: 'rose',
  },
  {
    id: 3,
    title: 'Scenario 3: Shelf Low, High Backroom Store Stock',
    shelfStatus: 'Low Stock (15 units)',
    storeInventory: '120 units',
    warehouseStock: '340 units',
    result: 'Shelf Replenishment Delay',
    recommendation: 'Backroom inventory exists. Floor staff should restock shelf D1.',
    actionLabel: 'Assign Restock',
    badgeVariant: 'amber',
  },
];

export const replenishmentRecommendations = [
  { id: 1, product: 'Coca Cola 500ml', shelf: 'A1', shelfStock: 12, warehouseStock: 86, urgency: 'High', action: 'Replenish Shelf' },
  { id: 2, product: 'Lays Classic Chips', shelf: 'B1', shelfStock: 0, warehouseStock: 42, urgency: 'Critical', action: 'Allocate Stock' },
  { id: 3, product: 'Maggi 2-Min Noodles', shelf: 'D1', shelfStock: 15, warehouseStock: 95, urgency: 'Medium', action: 'Restock Shelf' },
];

export const shelfInsights = [
  { id: 1, text: '6 shelves require immediate attention due to empty stock conditions.' },
  { id: 2, text: 'Beverage shelves (Aisle 1) record the highest customer interaction rate (42 pickups/hr).' },
  { id: 3, text: 'Lays Classic Chips is currently unavailable on shelf B1 despite 42 units in warehouse.' },
  { id: 4, text: '86 units of Coca Cola are available in the central warehouse for shelf replenishment.' },
];
