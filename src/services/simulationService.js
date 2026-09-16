import { presetScenarios } from '../data/simulationData';
import { simulateStockTransferScenario } from '../utils/intelligenceEngine';

export const simulationService = {
  getPresetScenarios: async () => presetScenarios,
  runSimulation: async (scenarioId, customParams = {}) => {
    if (scenarioId === 'SCN-01' || !scenarioId) {
      return simulateStockTransferScenario(customParams);
    }
    // Generic fallback mock calculation for other scenarios
    return {
      before: {
        daysOfCoverage: '1.2 days',
        stockoutRiskScore: 92,
        riskLevel: 'Critical',
        estimatedWaitTime: '4.8 mins',
      },
      after: {
        daysOfCoverage: '5.2 days',
        stockoutRiskScore: 18,
        riskLevel: 'Low',
        riskReductionPct: 80,
        estimatedWaitTime: '1.6 mins',
        revenueImpact: '₹18,500'
      }
    };
  }
};
