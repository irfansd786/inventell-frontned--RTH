export const queueKpiData = {
  activeQueues: 4,
  peopleWaiting: 19,
  avgWaitTime: '4m 12s',
  queueAlerts: 2,
};

export const checkoutCounters = [
  { id: 1, name: 'Checkout 1 (Main)', peopleWaiting: 3, waitTime: '2m 15s', status: 'NORMAL', transactions: 142, avgServiceTime: '1m 30s', color: 'emerald' },
  { id: 2, name: 'Checkout 2 (Express)', peopleWaiting: 9, waitTime: '6m 30s', status: 'HIGH', transactions: 198, avgServiceTime: '2m 10s', color: 'rose' },
  { id: 3, name: 'Checkout 3 (Self-Serve)', peopleWaiting: 2, waitTime: '1m 45s', status: 'NORMAL', transactions: 110, avgServiceTime: '1m 15s', color: 'emerald' },
  { id: 4, name: 'Checkout 4 (Priority)', peopleWaiting: 5, waitTime: '4m 20s', status: 'MEDIUM', transactions: 86, avgServiceTime: '1m 45s', color: 'amber' },
];

export const queueLengthTrendData = [
  { time: '12 PM', Checkout1: 2, Checkout2: 4, Checkout3: 1, Checkout4: 2 },
  { time: '2 PM', Checkout1: 3, Checkout2: 5, Checkout3: 2, Checkout4: 3 },
  { time: '4 PM', Checkout1: 4, Checkout2: 7, Checkout3: 2, Checkout4: 4 },
  { time: '6 PM', Checkout1: 3, Checkout2: 9, Checkout3: 2, Checkout4: 5 },
  { time: '8 PM', Checkout1: 2, Checkout2: 6, Checkout3: 1, Checkout4: 3 },
  { time: '10 PM', Checkout1: 1, Checkout2: 2, Checkout3: 0, Checkout4: 1 },
];

export const waitTimeTrendData = [
  { time: 'Morning (8-12)', avgWait: '2m 10s', seconds: 130 },
  { time: 'Afternoon (12-4)', avgWait: '3m 45s', seconds: 225 },
  { time: 'Evening (4-8)', avgWait: '6m 12s', seconds: 372 },
  { time: 'Night (8-10)', avgWait: '2m 30s', seconds: 150 },
];

export const counterPerformanceTable = [
  { id: 'c1', name: 'Checkout 1', transactions: 142, avgWait: '2m 15s', avgServiceTime: '1m 30s', peakQueue: 5, status: 'Normal' },
  { id: 'c2', name: 'Checkout 2', transactions: 198, avgWait: '6m 30s', avgServiceTime: '2m 10s', peakQueue: 11, status: 'Congested' },
  { id: 'c3', name: 'Checkout 3', transactions: 110, avgWait: '1m 45s', avgServiceTime: '1m 15s', peakQueue: 3, status: 'Optimal' },
  { id: 'c4', name: 'Checkout 4', transactions: 86, avgWait: '4m 20s', avgServiceTime: '1m 45s', peakQueue: 7, status: 'Moderate' },
];

export const queueCongestionAlert = {
  active: true,
  title: 'Checkout Congestion Detected',
  counter: 'Checkout 2',
  peopleCount: 9,
  estimatedWait: '6m 30s',
  recommendation: 'Consider opening another checkout counter or routing express shoppers to Checkout 3.',
};

export const queueHistoryEvents = [
  { time: '06:10 PM', text: 'Checkout 2 crossed threshold (9 customers waiting)', type: 'alert' },
  { time: '06:25 PM', text: 'Queue length at Checkout 1 returned below threshold (3 customers)', type: 'normal' },
  { time: '06:42 PM', text: 'Checkout 4 reached medium congestion (5 customers)', type: 'warning' },
  { time: '07:05 PM', text: 'Staff notification dispatched to open Checkout Counter 5', type: 'action' },
];

export const queueThresholdConfig = {
  normal: '0–5 customers (Wait < 3m)',
  medium: '6–7 customers (Wait 3-5m)',
  high: '8+ customers (Wait > 5m)',
};
