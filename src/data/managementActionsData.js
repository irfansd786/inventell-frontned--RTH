export const managementActionsList = [
  {
    id: 'ACT-101',
    recommendation: 'Transfer 40 Coca Cola 500ml units from Central Warehouse to Main Street Store',
    reason: 'Projected stockout within 1.2 days based on customer dwell surge.',
    expectedImpact: 'Reduce stockout probability from 92% to 18%. Protect ₹18,500 revenue.',
    confidence: '94%',
    relatedModule: 'Warehouse Allocation',
    modulePath: '/allocation',
    status: 'Pending', // Pending | Approved | In Progress | Completed | Rejected
    suggestedAction: 'Allocate Stock',
    details: {
      sku: 'BEV-001',
      source: 'Central Warehouse',
      destination: 'Main Street Store',
      qty: 40
    }
  },
  {
    id: 'ACT-102',
    recommendation: 'Open additional Checkout Counter 3 and assign associate Staff-004',
    reason: 'Computer Vision predicts queue wait time > 4.5 mins between 6:00 PM and 7:30 PM.',
    expectedImpact: 'Reduce average queue wait time to 1.8 minutes. Eliminate ₹42,000 abandonment risk.',
    confidence: '91%',
    relatedModule: 'Queue Analytics & Staff',
    modulePath: '/queues',
    status: 'Pending',
    suggestedAction: 'Assign Staff to Counter 3',
    details: {
      counter: 'Counter 3',
      staff: 'Staff-004 (Ankit Sharma)',
      shiftTime: '17:45 - 19:45'
    }
  },
  {
    id: 'ACT-103',
    recommendation: 'Transfer 60 units of Lays Classic Chips 50g from Warehouse',
    reason: 'Aisle 2 shelf facing is empty. Store backroom has only 8 units left.',
    expectedImpact: 'Prevent sales loss of ₹9,600 during evening rush.',
    confidence: '96%',
    relatedModule: 'Low Stock & Transfers',
    modulePath: '/low-stock',
    status: 'Approved',
    suggestedAction: 'Execute Express Transfer',
    details: {
      sku: 'SNK-001',
      source: 'Central Warehouse',
      destination: 'Main Street Store',
      qty: 60
    }
  },
  {
    id: 'ACT-104',
    recommendation: 'Reallocate Picking Task for Order ORD-1004 to Staff-008',
    reason: 'Order fulfillment SLA target is 30 mins; order allocated 40 mins ago.',
    expectedImpact: 'Maintain 98% on-time dispatch SLA.',
    confidence: '88%',
    relatedModule: 'Picking Operations',
    modulePath: '/picking',
    status: 'In Progress',
    suggestedAction: 'Assign Picker',
    details: {
      orderId: 'ORD-1004',
      newPicker: 'Staff-008 (Suresh Kumar)'
    }
  },
  {
    id: 'ACT-105',
    recommendation: 'Apply 15% End-Cap Discount on Tropicana Orange 1L',
    reason: 'Overstock holdings of 425 units with 45-day shelf life remaining.',
    expectedImpact: 'Increase sales velocity by +350% and avoid ₹28,000 expiry loss.',
    confidence: '82%',
    relatedModule: 'Inventory',
    modulePath: '/inventory',
    status: 'Completed',
    suggestedAction: 'Activate Promotion',
    details: {
      sku: 'BEV-004',
      discountPct: 15,
      durationDays: 7
    }
  }
];
