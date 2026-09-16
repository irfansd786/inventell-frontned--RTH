export const zoneKpis = {
  totalZones: 6,
  totalVisitors: '1,248',
  avgDwellTime: '4m 18s',
  highestTrafficZone: 'Beverages',
};

export const zonePerformanceTableData = [
  { id: 'z-bev', name: 'Beverages', visitors: 312, dwellTime: '4m 32s', trafficShare: '23%', peakTime: '6 PM', trend: '+8%', status: 'High', color: 'rose' },
  { id: 'z-[snk]', name: 'Snacks', visitors: 267, dwellTime: '6m 18s', trafficShare: '18%', peakTime: '5 PM', trend: '+5%', status: 'Medium', color: 'amber' },
  { id: 'z-pc', name: 'Personal Care', visitors: 223, dwellTime: '2m 41s', trafficShare: '16%', peakTime: '4 PM', trend: '-2%', status: 'Normal', color: 'emerald' },
  { id: 'z-hh', name: 'Household', visitors: 180, dwellTime: '1m 52s', trafficShare: '12%', peakTime: '3 PM', trend: '+1%', status: 'Low', color: 'slate' },
  { id: 'z-dry', name: 'Dairy', visitors: 120, dwellTime: '2m 06s', trafficShare: '8%', peakTime: '7 PM', trend: '+4%', status: 'Low', color: 'slate' },
  { id: 'z-oth', name: 'Others', visitors: 146, dwellTime: '3m 12s', trafficShare: '23%', peakTime: '6 PM', trend: '0%', status: 'Medium', color: 'emerald' },
];

export const zoneTrafficTrendData = [
  { time: '8 AM', Beverages: 35, Snacks: 20, PersonalCare: 15, Household: 10, Dairy: 8 },
  { time: '10 AM', Beverages: 90, Snacks: 65, PersonalCare: 50, Household: 35, Dairy: 25 },
  { time: '12 PM', Beverages: 150, Snacks: 120, PersonalCare: 95, Household: 70, Dairy: 45 },
  { time: '2 PM', Beverages: 130, Snacks: 110, PersonalCare: 80, Household: 60, Dairy: 40 },
  { time: '4 PM', Beverages: 210, Snacks: 180, PersonalCare: 140, Household: 100, Dairy: 70 },
  { time: '6 PM', Beverages: 312, Snacks: 267, PersonalCare: 223, Household: 180, Dairy: 120 },
  { time: '8 PM', Beverages: 240, Snacks: 190, PersonalCare: 160, Household: 120, Dairy: 90 },
];

export const zoneDwellComparisonData = [
  { zone: 'Snacks', dwellSeconds: 378, display: '6m 18s' },
  { zone: 'Beverages', dwellSeconds: 272, display: '4m 32s' },
  { zone: 'Others', dwellSeconds: 192, display: '3m 12s' },
  { zone: 'Personal Care', dwellSeconds: 161, display: '2m 41s' },
  { zone: 'Dairy', dwellSeconds: 126, display: '2m 06s' },
  { zone: 'Household', dwellSeconds: 112, display: '1m 52s' },
];

export const zoneRankings = [
  { rank: 1, name: 'Beverages Zone', score: '98/100', reason: 'Highest total traffic & conversion pace' },
  { rank: 2, name: 'Snacks Zone', score: '91/100', reason: 'Longest average customer dwell time (6m 18s)' },
  { rank: 3, name: 'Personal Care Zone', score: '78/100', reason: 'Consistent steady afternoon visitor volume' },
  { rank: 4, name: 'Dairy Zone', score: '65/100', reason: 'High evening surge during grocery hours' },
  { rank: 5, name: 'Household Zone', score: '52/100', reason: 'Shortest dwell time and lowest engagement' },
];

export const zoneInsights = [
  { id: 1, text: 'Beverage zone attracts the highest total visitor volume (312 shoppers today).' },
  { id: 2, text: 'Snacks zone commands the longest average dwell duration (6m 18s per visitor).' },
  { id: 3, text: 'Household section has below-average dwell time (1m 52s), indicating quick pass-through behavior.' },
  { id: 4, text: 'Beverage traffic surges by +180% during the evening peak window (5 PM – 7 PM).' },
];
