export const monitoringStatsData = {
  peopleInStore: 37,
  entryCount: 124,
  exitCount: 87,
  occupancyPercent: 37,
  avgDwellTime: '18m 24s',
  queueLength: 9,
  cameraName: 'Camera 01 - Main Entrance',
  cameraStatus: 'LIVE',
  fps: '30 FPS',
  resolution: '1080p',
};

export const detectionEventsData = [
  { time: '11:05 AM', type: 'Entry', id: 'ID:1042', zone: 'Main Entrance', confidence: '98%' },
  { time: '11:08 AM', type: 'Entry', id: 'ID:1049', zone: 'Main Entrance', confidence: '96%' },
  { time: '11:12 AM', type: 'Exit', id: 'ID:1042', zone: 'Exit Gate B', confidence: '99%' },
  { time: '11:15 AM', type: 'Entry', id: 'ID:1052', zone: 'Main Entrance', confidence: '94%' },
  { time: '11:20 AM', type: 'Exit', id: 'ID:1041', zone: 'Exit Gate A', confidence: '97%' },
  { time: '11:24 AM', type: 'Entry', id: 'ID:1058', zone: 'Main Entrance', confidence: '95%' },
  { time: '11:28 AM', type: 'Dwell Alert', id: 'ID:1033', zone: 'Beverages', confidence: '92%' },
];

export const simulatedBoundingBoxes = [
  { id: '101', x: 20, y: 35, width: 14, height: 28, label: 'Person ID:101', dwell: '12m', status: 'normal' },
  { id: '102', x: 42, y: 25, width: 15, height: 32, label: 'Person ID:102', dwell: '4m', status: 'normal' },
  { id: '103', x: 70, y: 50, width: 16, height: 30, label: 'Person ID:103', dwell: '18m', status: 'queue' },
  { id: '104', x: 80, y: 55, width: 14, height: 29, label: 'Person ID:104', dwell: '6m', status: 'queue' },
];
