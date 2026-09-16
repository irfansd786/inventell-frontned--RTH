import { apiGet, apiPost } from './api';

export async function getRecommendations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiGet(`/recommendations${qs ? `?${qs}` : ''}`);
}

export async function approveRecommendation(id) {
  return apiPost(`/recommendations/${id}/approve`);
}

export async function launchRecommendation(id) {
  return apiPost(`/recommendations/${id}/launch`);
}

export async function rejectRecommendation(id) {
  return apiPost(`/recommendations/${id}/reject`);
}
