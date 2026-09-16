export const heatmapKpis = {
  avgDensity: '42%',
  peakDensity: '78%',
  highestTrafficZone: 'Beverages Aisle 1',
  activeTrackedAreas: 8,
};

export const heatmapFloorZones = [
  { id: 'entrance', name: 'Main Entrance & Foyer', density: 78, dwell: '2m 10s', trafficShare: '25%', level: 'Very High', color: '#EF4444' },
  { id: 'beverages', name: 'Beverages Aisle 1', density: 82, dwell: '4m 32s', trafficShare: '23%', level: 'Very High', color: '#EF4444' },
  { id: 'snacks', name: 'Snacks & Confectionery Aisle 2', density: 65, dwell: '6m 18s', trafficShare: '18%', level: 'High', color: '#F59E0B' },
  { id: 'personal_care', name: 'Personal Care & Hygiene', density: 42, dwell: '2m 41s', trafficShare: '16%', level: 'Medium', color: '#10B981' },
  { id: 'household', name: 'Household & Cleaning', density: 28, dwell: '1m 52s', trafficShare: '12%', level: 'Low', color: '#3B82F6' },
  { id: 'dairy', name: 'Dairy & Refrigerated', density: 48, dwell: '2m 06s', trafficShare: '8%', level: 'Medium', color: '#10B981' },
  { id: 'checkout2', name: 'Checkout Counter 2 (Express)', density: 88, dwell: '6m 30s', trafficShare: '18%', level: 'Very High', color: '#DC2626' },
  { id: 'checkout1', name: 'Checkout Counter 1 (Main)', density: 35, dwell: '2m 15s', trafficShare: '12%', level: 'Low', color: '#3B82F6' },
];

export const zoneTrafficComparisonData = [
  { zone: 'Beverages', share: 23, count: 312 },
  { zone: 'Snacks', share: 18, count: 267 },
  { zone: 'Personal Care', share: 16, count: 223 },
  { zone: 'Household', share: 12, count: 180 },
  { zone: 'Dairy', share: 8, count: 120 },
  { zone: 'Others', share: 23, count: 146 },
];

export const topHeatZones = [
  { rank: 1, name: 'Beverage Zone (Aisle 1)', trafficPercent: '23%', status: 'Critical Density' },
  { rank: 2, name: 'Snacks Zone (Aisle 2)', trafficPercent: '18%', status: 'High Engagement' },
  { rank: 3, name: 'Main Entrance Gate', trafficPercent: '25%', status: 'Continuous Flow' },
  { rank: 4, name: 'Checkout Counter 2 Area', trafficPercent: '18%', status: 'Queue Bottleneck' },
];

export const movementAnalytics = {
  avgMovementTime: '7m 42s',
  mostVisitedZone: 'Beverages Aisle 1',
  mostFrequentRoute: 'Entrance → Beverages → Snacks → Checkout 2',
  crossZoneConversion: '68%',
};

export const heatmapInsights = [
  { id: 1, text: 'Beverage zone receives the highest customer traffic concentration across all daytime hours.' },
  { id: 2, text: 'Checkout 2 area experiences bottleneck density (88% peak density) between 5:30 PM and 7:00 PM.' },
  { id: 3, text: 'Household section registered low relative density (28%), suggesting promotional signage opportunity.' },
  { id: 4, text: '68% of shoppers who visit Beverages immediately navigate toward the Snacks aisle.' },
];
