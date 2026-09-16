import { warehouseKpis, warehouseActivityTimeline } from '../data/warehouseData';
import { masterProducts } from '../data/productsData';

export async function getWarehouseData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        kpis: warehouseKpis,
        timeline: warehouseActivityTimeline,
        products: masterProducts,
      });
    }, 150);
  });
}
