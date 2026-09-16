// Dashboard service layer — the ONLY place that talks to dashboard APIs.
// Components/hooks consume these functions; no business data lives in JSX.
//
// Backend endpoints (FastAPI):
//   GET /api/dashboard/summary
//   GET /api/dashboard/revenue?range=today|7d|30d
//   GET /api/dashboard/store-intelligence
//   GET /api/dashboard/inventory-health
//   GET /api/dashboard/risks
//   GET /api/dashboard/ai-insights
//   GET /api/dashboard/operations

import { apiGet } from './api';

export async function getDashboardSummary(range = '7d') {
  return apiGet(`/dashboard/summary?range=${encodeURIComponent(range)}`);
}

export async function getRevenueSeries(range = '7d', metric = 'revenue') {
  return apiGet(`/dashboard/revenue?range=${encodeURIComponent(range)}&metric=${encodeURIComponent(metric)}`);
}

export async function getSalesIntelligence(range = '7d') {
  return apiGet(`/dashboard/sales-intelligence?range=${encodeURIComponent(range)}`);
}

export async function getStoreIntelligence() {
  return apiGet('/dashboard/store-intelligence');
}

export async function getInventoryHealth() {
  return apiGet('/dashboard/inventory-health');
}

export async function getDashboardRisks() {
  return apiGet('/dashboard/risks');
}

export async function getDashboardAiInsights() {
  return apiGet('/dashboard/ai-insights');
}

export async function getOperationsFlow() {
  return apiGet('/dashboard/operations');
}

export async function getSalesSummary() {
  return apiGet('/sales/summary');
}

export async function getSalesByCategory() {
  return apiGet('/sales/categories');
}
