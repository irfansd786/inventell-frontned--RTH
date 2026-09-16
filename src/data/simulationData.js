export const presetScenarios = [
  {
    id: 'SCN-01',
    name: 'Stock Transfer to Main Street Store',
    description: 'Simulate stockout probability reduction and revenue impact when transferring 40 units of Coca Cola from Warehouse.',
    category: 'Inventory & Transfer',
    inputs: {
      product: 'Coca Cola 500ml (BEV-001)',
      currentStoreStock: 12,
      warehouseStock: 86,
      dailySales: 10,
      expectedDemandIncreasePct: 25,
      transferQuantity: 40
    }
  },
  {
    id: 'SCN-02',
    name: 'Open Additional Checkout Counter',
    description: 'Simulate average wait time reduction and abandoned cart revenue recovery by opening Counter 3.',
    category: 'Queue & Staffing',
    inputs: {
      product: 'N/A (Checkout Counter 3)',
      currentWaitTimeMins: 4.8,
      activeCounters: 2,
      peakFootfallPerHour: 640,
      additionalCounters: 1
    }
  },
  {
    id: 'SCN-03',
    name: 'Weekend Promotional Demand Surge',
    description: 'Simulate inventory depletion and reorder levels under a +50% weekend demand spike.',
    category: 'Demand Forecasting',
    inputs: {
      product: 'Packaged Snacks Category',
      baselineDailySales: 120,
      surgeMultiplier: 1.5,
      storeStockOnHand: 280,
      leadTimeDays: 2
    }
  },
  {
    id: 'SCN-04',
    name: 'Supplier Delivery Delay Impact',
    description: 'Simulate buffer stock safety days if Nestlé supplier delivery is delayed by 3 additional days.',
    category: 'Supply Chain Risk',
    inputs: {
      product: 'Maggi Masala Noodles 280g',
      normalLeadTimeDays: 3,
      delayDays: 3,
      storeStockOnHand: 35,
      dailyConsumption: 8
    }
  }
];
