export const activityLogList = [
  {
    id: 'LOG-5001',
    timestamp: '2026-09-05 10:14:22',
    userOrSystem: 'AI System Engine',
    action: 'Stockout Risk Detected',
    module: 'Risks',
    description: 'Generated critical risk RSK-101 for Coca Cola 500ml (store stock 12 units).',
    status: 'Flagged',
    details: 'Triggered by dwell time surge + run rate > 10 units/day.'
  },
  {
    id: 'LOG-5002',
    timestamp: '2026-09-05 10:10:15',
    userOrSystem: 'Rahul Verma (Manager)',
    action: 'Approved Action ACT-103',
    module: 'Management Actions',
    description: 'Approved transfer of 60 Lays Classic Chips units from Central Warehouse.',
    status: 'Success',
    details: 'Transfer TR-1022 created and routed to Warehouse Allocation.'
  },
  {
    id: 'LOG-5003',
    timestamp: '2026-09-05 09:55:00',
    userOrSystem: 'System POS Gateway',
    action: 'Billing Transaction Completed',
    module: 'Billing & Sales',
    description: 'Processed Invoice INV-10234 for ₹1,450 (UPI Payment).',
    status: 'Success',
    details: '6 items decremented from store stock.'
  },
  {
    id: 'LOG-5004',
    timestamp: '2026-09-05 09:42:10',
    userOrSystem: 'Suresh Kumar (Picker)',
    action: 'Order Picked',
    module: 'Picking Operations',
    description: 'Completed item pick list for Order ORD-1002 in Warehouse Zone B.',
    status: 'Success',
    details: 'Moved to Packing Queue.'
  },
  {
    id: 'LOG-5005',
    timestamp: '2026-09-05 09:20:45',
    userOrSystem: 'CV Analytics Engine',
    action: 'Queue Threshold Alert',
    module: 'Alerts',
    description: 'Detected 9 queued customers at Counter 2 (Threshold: 5).',
    status: 'Alert Generated',
    details: 'Alert ALT-102 sent to Manager dashboard.'
  },
  {
    id: 'LOG-5006',
    timestamp: '2026-09-05 08:30:00',
    userOrSystem: 'System Automated Job',
    action: 'Daily Sales Report Generated',
    module: 'Reports',
    description: 'Compiled morning operational report for Main Street Store ST-001.',
    status: 'Completed',
    details: 'PDF copy archived in Report Center.'
  },
  {
    id: 'LOG-5007',
    timestamp: '2026-09-05 08:05:12',
    userOrSystem: 'Rahul Verma (Manager)',
    action: 'Settings Threshold Updated',
    module: 'Settings',
    description: 'Updated AI confidence alert threshold from 85% to 90%.',
    status: 'Updated',
    details: 'User settings persisted locally.'
  }
];
