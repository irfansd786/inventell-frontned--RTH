export const initialNotificationsList = [
  {
    id: 'NTF-01',
    title: 'Stockout Risk Detected for Coca Cola 500ml',
    description: 'Store stock reduced to 12 units (Run rate: 10 units/day). Risk Score: 92.',
    severity: 'Critical',
    time: '5m ago',
    read: false,
    path: '/risks'
  },
  {
    id: 'NTF-02',
    title: 'AI Recommendation Requires Approval',
    description: 'Transfer 40 units from Warehouse to Store to avoid stockout.',
    severity: 'High',
    time: '12m ago',
    read: false,
    path: '/management-actions'
  },
  {
    id: 'NTF-03',
    title: 'Order ORD-1002 Ready for Dispatch',
    description: 'Package verified in Packing Station 1. Carrier assigned.',
    severity: 'Medium',
    time: '25m ago',
    read: false,
    path: '/dispatch'
  },
  {
    id: 'NTF-04',
    title: 'Queue Congestion Threshold Alert',
    description: 'Counter 2 wait time exceeded 4 minutes (9 customers waiting).',
    severity: 'High',
    time: '40m ago',
    read: true,
    path: '/queues'
  }
];
