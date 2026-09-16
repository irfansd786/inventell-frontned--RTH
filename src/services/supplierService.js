import { supplierKpis, masterSuppliersList } from '../data/supplierData';

export async function getSuppliersData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        kpis: supplierKpis,
        suppliers: masterSuppliersList,
      });
    }, 150);
  });
}
