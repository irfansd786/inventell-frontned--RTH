// Shelf Intelligence service layer calling real backend shelf telemetry and database inventory.
import { apiGet, apiPost } from './api';

export async function getShelfIntelligenceData(cameraId = 'camera_01', timestamp = 0.0) {
  try {
    const data = await apiGet(`/api/analytics/shelf?camera_id=${cameraId}&timestamp=${timestamp}`);
    const isConnected = data?.connected !== false;

    return {
      connected: isConnected,
      statusLabel: data?.status_label || (isConnected ? 'ANALYSIS RUNNING' : 'AWAITING CCTV DATA'),
      dataProvenance: data?.data_provenance || 'CCTV Zone Tracking + Inventory Dataset + Sales Velocity',
      kpis: {
        shelvesMonitored: data?.kpis?.shelves_monitored ?? 0,
        shelvesMonitoredSub: data?.kpis?.shelves_monitored_sub || 'Store zones monitored',
        lowStockItems: data?.kpis?.low_stock_items ?? 0,
        lowStockSub: data?.kpis?.low_stock_sub || 'Calculated from inventory',
        emptySlots: data?.kpis?.empty_slots, // None / null when model unavailable
        emptySlotsLabel: data?.kpis?.empty_slots_label || 'Awaiting shelf detection',
        emptySlotsSub: data?.kpis?.empty_slots_sub || 'CV model pending',
        shelfHealth: data?.kpis?.shelf_health || '0%',
        shelfHealthSub: data?.kpis?.shelf_health_sub || 'Calculated from inventory',
        stockoutRisk: data?.kpis?.stockout_risk || 'LOW',
        stockoutRiskSub: data?.kpis?.stockout_risk_sub || 'Demand vs stock velocity',
      },
      shelfBays: data?.shelf_bays || [],
      productsTable: data?.products_table || [],
      activityTrend: data?.activity_trend || [],
      categoryRisk: data?.category_risk || [],
      people: data?.people || [],
      shelfMap: data?.shelf_map || null,
      aiInsight: data?.ai_insight || {
        title: isConnected ? 'Shelf Telemetry Active' : 'Shelf Analytics Unavailable',
        description: isConnected
          ? 'Calculated from real inventory, sales velocity, and CCTV observations.'
          : 'Waiting for analysis — shelf intelligence backend unavailable.',
        severity: data?.kpis?.stockout_risk || 'LOW',
        timestamp: isConnected ? 'Active' : 'Awaiting data',
        recommendationText: isConnected ? 'Maintain stock levels.' : 'Awaiting data connection.',
        dataSource: 'INVENTORY DATA + CCTV',
      },
      recommendations: data?.recommendations || [],
    };
  } catch (err) {
    console.warn('Shelf telemetry API offline, showing honest unavailable state:', err);
    return {
      connected: false,
      statusLabel: 'DATA UNAVAILABLE',
      dataProvenance: 'Awaiting Backend Connection',
      kpis: {
        shelvesMonitored: 0,
        shelvesMonitoredSub: 'Telemetry offline',
        lowStockItems: 0,
        lowStockSub: 'Data unavailable',
        emptySlots: null,
        emptySlotsLabel: 'Awaiting shelf detection',
        emptySlotsSub: 'CV model pending',
        shelfHealth: '0%',
        shelfHealthSub: 'Awaiting connection',
        stockoutRisk: 'LOW',
        stockoutRiskSub: 'Awaiting data',
      },
      shelfBays: [],
      productsTable: [],
      activityTrend: [],
      categoryRisk: [],
      people: [],
      shelfMap: null,
      aiInsight: {
        title: 'Shelf Intelligence Engine Unavailable',
        description: 'Waiting for analysis — unable to reach FastAPI backend server.',
        severity: 'LOW',
        timestamp: 'Unavailable',
        recommendationText: 'Start FastAPI backend server and ensure database is populated.',
        dataSource: 'INVENTORY DATA',
      },
      recommendations: [],
    };
  }
}

// Real database replenishment API call: transfers stock from warehouse to store floor
export async function replenishShelfProduct(productId, quantity = 24) {
  return apiPost('/inventory/replenish', { product_id: productId, quantity });
}
