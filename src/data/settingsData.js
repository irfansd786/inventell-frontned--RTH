export const defaultSettingsData = {
  general: {
    storeName: 'Main Street Superstore',
    storeLocation: '124 Commercial Plaza, Mg Road, Sector 14',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST +5:30)'
  },
  dashboard: {
    defaultView: 'Command Center',
    refreshIntervalSeconds: 15,
    defaultDateRange: 'Today'
  },
  notifications: {
    criticalRisks: true,
    stockAlerts: true,
    queueAlerts: true,
    salesAlerts: false,
    aiRecommendations: true
  },
  intelligence: {
    aiConfidenceThreshold: 85,
    riskAlertThreshold: 75,
    forecastAlertThreshold: 80
  },
  appearance: {
    theme: 'Light Workspace (Dark Sidebar)',
    compactMode: false,
    animations: true
  },
  system: {
    version: 'INVINTELL Enterprise v4.2.0',
    environment: 'Production Frontend (Mock Services Connected)',
    dataStatus: 'Synchronized (0 Error Logs)'
  }
};
