import { apiGet } from './api';

export async function getDatasets() {
  return apiGet('/datasets');
}
