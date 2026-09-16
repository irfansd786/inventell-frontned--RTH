// Permission Definitions & Module Mappings for INVINTELL RBAC
// Stable IDs used for authorization checks across routes, sidebar, and modals

export const ALL_PERMISSION_IDS = [
  // Store Intelligence
  'store_monitor',
  'customer_analytics',
  'spatial_intelligence',
  'queue_intelligence',

  // Sales & Inventory
  'billing_sales',
  'products',
  'inventory',
  'low_stock',
  'forecasting',

  // Intelligence
  'ai_insights',
  'alerts',
  'exceptions',

  // Warehouse Operations
  'orders',
  'allocation',
  'picking',
  'packing',
  'dispatch',

  // Reporting & Staff
  'finance',
  'staff',
  'report_center',
];

export const MODULE_GROUPS = [
  {
    id: 'store_intelligence',
    title: 'Store Intelligence',
    description: 'Vision telemetry, customer dwell analysis, zones and checkout queues',
    modules: [
      { id: 'store_monitor', name: 'Live Store Monitor', path: '/monitoring' },
      { id: 'customer_analytics', name: 'Customer Analytics', path: '/customer-analytics' },
      { id: 'spatial_intelligence', name: 'Spatial Intelligence', path: '/zone' },
      { id: 'queue_intelligence', name: 'Queue Intelligence', path: '/queues' },
    ],
  },
  {
    id: 'sales_inventory',
    title: 'Sales & Inventory',
    description: 'POS transactions, catalog, stock levels, reorders, and predictive forecasting',
    modules: [
      { id: 'billing_sales', name: 'Billing & Sales', path: '/billing' },
      { id: 'products', name: 'Products Catalog', path: '/inventory' },
      { id: 'inventory', name: 'Inventory Management', path: '/inventory' },
      { id: 'low_stock', name: 'Low Stock & Reorders', path: '/low-stock' },
      { id: 'forecasting', name: 'Demand Forecasting', path: '/forecasting' },
    ],
  },
  {
    id: 'intelligence',
    title: 'Intelligence',
    description: 'Executive AI recommendations, real-time alerts matrix and systemic exceptions',
    modules: [
      { id: 'ai_insights', name: 'AI Insights', path: '/ai-insights' },
      { id: 'alerts', name: 'Alerts Matrix', path: '/alerts' },
      { id: 'exceptions', name: 'System Exceptions', path: '/exceptions' },
    ],
  },
  {
    id: 'warehouse_operations',
    title: 'Warehouse Operations',
    description: 'End-to-end fulfillment: orders, stock reservation, picking, packing, dispatch',
    modules: [
      { id: 'orders', name: 'Orders Console', path: '/orders' },
      { id: 'allocation', name: 'Stock Allocation', path: '/allocation' },
      { id: 'picking', name: 'Picking Management', path: '/picking' },
      { id: 'packing', name: 'Packing Station', path: '/packing' },
      { id: 'dispatch', name: 'Dispatch & Shipping', path: '/dispatch' },
    ],
  },
  {
    id: 'reporting_staff',
    title: 'Reporting & Staff',
    description: 'Financial telemetry, staff permissions management, and report generation center',
    modules: [
      { id: 'finance', name: 'Finance & P&L', path: '/finance' },
      { id: 'staff', name: 'Staff Management', path: '/staff' },
      { id: 'report_center', name: 'Report Center', path: '/reports' },
    ],
  },
];

// All flat modules list
export const ALL_MODULES = MODULE_GROUPS.flatMap((group) => group.modules);

// Quick lookup map: permissionId -> Friendly module info
export const MODULE_MAP = MODULE_GROUPS.reduce((acc, group) => {
  group.modules.forEach((mod) => {
    acc[mod.id] = { ...mod, groupTitle: group.title };
  });
  return acc;
}, {});

// Path lookup: pathname -> required permissionId
export const PATH_TO_PERMISSION = {
  '/monitoring': 'store_monitor',
  '/customer-analytics': 'customer_analytics',
  '/zone': 'spatial_intelligence',
  '/zones': 'spatial_intelligence',
  '/heatmap': 'spatial_intelligence',
  '/spatial-intelligence': 'spatial_intelligence',
  '/queues': 'queue_intelligence',
  '/queue-intelligence': 'queue_intelligence',
  '/shelves': 'inventory',
  '/shelf-intelligence': 'inventory',

  '/billing': 'billing_sales',
  '/sales': 'billing_sales',
  '/inventory': 'inventory',
  '/products': 'products',
  '/low-stock': 'low_stock',
  '/forecasting': 'forecasting',

  '/ai-insights': 'ai_insights',
  '/alerts': 'alerts',
  '/exceptions': 'exceptions',

  '/orders': 'orders',
  '/allocation': 'allocation',
  '/picking': 'picking',
  '/packing': 'packing',
  '/dispatch': 'dispatch',

  '/finance': 'finance',
  '/staff': 'staff',
  '/reports': 'report_center',
};
