/**
 * INVINTELL Intelligence Engine (Mock Deterministic Rule Processor)
 * Provides intelligence logic for Risk, AI Insights, Alerts, and Scenario Simulations.
 */

export function calculateStockoutRisk(storeStock, reorderLevel, dailySales) {
  if (dailySales <= 0) return { score: 10, level: 'Low', status: 'Healthy', daysRemaining: 99 };
  const daysRemaining = (storeStock / dailySales).toFixed(1);

  if (storeStock === 0) {
    return { score: 98, level: 'Critical', status: 'Out of Stock', daysRemaining: 0 };
  } else if (storeStock <= reorderLevel * 0.5) {
    return { score: 92, level: 'Critical', status: 'Imminent Stockout', daysRemaining };
  } else if (storeStock <= reorderLevel) {
    return { score: 75, level: 'High', status: 'Low Stock', daysRemaining };
  } else if (storeStock <= reorderLevel * 1.5) {
    return { score: 45, level: 'Medium', status: 'Moderate', daysRemaining };
  }
  return { score: 18, level: 'Low', status: 'Healthy', daysRemaining };
}

export function simulateStockTransferScenario({
  currentStoreStock = 12,
  warehouseStock = 86,
  dailySales = 10,
  expectedDemandIncreasePct = 25,
  transferQty = 40
}) {
  const adjustedDailySales = dailySales * (1 + expectedDemandIncreasePct / 100);
  
  // Before scenario
  const currentCoverage = (currentStoreStock / adjustedDailySales).toFixed(1);
  const currentRiskScore = currentStoreStock <= 15 ? 92 : currentStoreStock <= 30 ? 65 : 20;
  const currentRiskLevel = currentRiskScore > 80 ? 'Critical' : currentRiskScore > 50 ? 'High' : 'Low';
  
  // After scenario
  const newStoreStock = currentStoreStock + transferQty;
  const newWarehouseStock = Math.max(0, warehouseStock - transferQty);
  const newCoverage = (newStoreStock / adjustedDailySales).toFixed(1);
  const newRiskScore = newStoreStock > 40 ? 18 : 35;
  const newRiskLevel = newRiskScore > 80 ? 'Critical' : newRiskScore > 50 ? 'High' : 'Low';
  
  const revenueProtection = Math.round(transferQty * 45 * 0.95);
  
  return {
    before: {
      storeStock: currentStoreStock,
      warehouseStock,
      daysOfCoverage: currentCoverage,
      stockoutRiskScore: currentRiskScore,
      riskLevel: currentRiskLevel,
      projectedStockoutHours: Math.round(currentCoverage * 24),
    },
    after: {
      storeStock: newStoreStock,
      warehouseStock: newWarehouseStock,
      daysOfCoverage: newCoverage,
      stockoutRiskScore: newRiskScore,
      riskLevel: newRiskLevel,
      riskReductionPct: Math.round(((currentRiskScore - newRiskScore) / currentRiskScore) * 100),
      revenueImpact: `₹${revenueProtection.toLocaleString('en-IN')}`,
    }
  };
}

export function evaluateStoreHealthScore({
  criticalRisksCount = 2,
  highAlertsCount = 3,
  queueCongestion = false,
  fulfillmentRate = 96.8
}) {
  let score = 100;
  score -= criticalRisksCount * 3;
  score -= highAlertsCount * 1.5;
  if (queueCongestion) score -= 4;
  if (fulfillmentRate < 95) score -= 5;

  const rounded = Math.max(60, Math.min(100, Math.round(score)));
  let status = 'Excellent';
  if (rounded < 75) status = 'Needs Attention';
  else if (rounded < 85) status = 'Good';

  return { score: rounded, status };
}
