// Product service — API-first. Backend: /api/products (CRUD)
// Always resolves to an array so pages never crash when the backend is
// offline or returns a paginated { items: [] } envelope.
import { apiDelete, apiGet, apiPost, apiPut } from './api';
import { masterProducts } from '../data/productsData';

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  if (raw && Array.isArray(raw.data)) return raw.data;
  if (raw && Array.isArray(raw.products)) return raw.products;
  return null;
}

export async function getProductsData(params = {}) {
  const qs = new URLSearchParams(params).toString();
  try {
    const [raw, invRaw] = await Promise.all([
      apiGet(`/products${qs ? `?${qs}` : ''}`),
      apiGet('/inventory').catch(() => []),
    ]);
    const list = normalizeList(raw) || masterProducts;
    const invList = Array.isArray(invRaw) ? invRaw : invRaw?.items || [];
    const invByProduct = new Map((invList || []).map((i) => [i.product_id ?? i.id, i]));
    // Enrich catalog rows with live inventory (real stock, never invented).
    return list.map((p) => {
      const inv = invByProduct.get(p.id);
      return {
        ...p,
        storeStock: inv?.store_stock ?? p.storeStock ?? 0,
        warehouseStock: inv?.warehouse_stock ?? p.warehouseStock ?? 0,
        reorderLevel: inv?.reorder_level ?? p.reorderLevel ?? 0,
        status: inv?.status ?? p.status ?? '—',
      };
    });
  } catch {
    return masterProducts;
  }
}

export async function getProductById(productId) {
  return apiGet(`/products/${productId}`);
}

export async function createProduct(newProductData) {
  return apiPost('/products', newProductData);
}

export async function updateProduct(productId, patch) {
  return apiPut(`/products/${productId}`, patch);
}

export async function deleteProduct(productId) {
  return apiDelete(`/products/${productId}`);
}

export async function getProductCatalog() {
  return apiGet('/products/catalog');
}

export async function getProductKpis() {
  return apiGet('/products/kpis');
}

export async function getProductDetails(productId) {
  return apiGet(`/products/${productId}/details`);
}

/**
 * Shared Source of Truth for Global Product Master Summary
 * Dynamically computes total unique products/SKUs and inventory units.
 * Never hardcodes counts. Deduplicates by SKU or ID.
 */
export async function getProductMasterSummary() {
  // 1. Try backend dedicated summary endpoint
  try {
    const summary = await apiGet('/products/summary');
    if (summary && typeof summary.total_products === 'number' && summary.total_products > 0) {
      return {
        totalProducts: summary.total_products,
        activeProducts: summary.active_products ?? summary.total_products,
        totalSkus: summary.total_skus ?? summary.total_products,
        totalUnits: summary.total_units ?? 0,
        warehouseUnits: summary.warehouse_units ?? 0,
        storeUnits: summary.store_units ?? 0,
      };
    }
  } catch {
    // API endpoint unavailable; fall back to catalog or list
  }

  // 2. Try catalog endpoint
  try {
    const catalog = await apiGet('/products/catalog');
    if (Array.isArray(catalog) && catalog.length > 0) {
      const skuSet = new Set();
      let whUnits = 0;
      let storeUnits = 0;
      let activeCount = 0;

      catalog.forEach((p) => {
        const key = p.sku || p.id;
        if (key && !skuSet.has(key)) {
          skuSet.add(key);
          if (p.is_active !== false) activeCount++;
          whUnits += Number(p.warehouse_stock ?? p.warehouseStock ?? 0);
          storeUnits += Number(p.store_stock ?? p.storeStock ?? 0);
        }
      });

      const totalProducts = activeCount > 0 ? activeCount : skuSet.size;
      return {
        totalProducts,
        activeProducts: totalProducts,
        totalSkus: skuSet.size,
        totalUnits: whUnits + storeUnits,
        warehouseUnits: whUnits,
        storeUnits,
      };
    }
  } catch {
    // Catalog unavailable; fall back to local master
  }

  // 3. Fallback to masterProducts in data
  const skuSet = new Set();
  let whUnits = 0;
  let storeUnits = 0;

  masterProducts.forEach((p) => {
    const key = p.sku || p.id;
    if (key && !skuSet.has(key)) {
      skuSet.add(key);
      whUnits += Number(p.warehouseStock || 0);
      storeUnits += Number(p.storeStock || 0);
    }
  });

  const totalProducts = skuSet.size;
  return {
    totalProducts,
    activeProducts: totalProducts,
    totalSkus: totalProducts,
    totalUnits: whUnits + storeUnits,
    warehouseUnits: whUnits,
    storeUnits,
  };
}

export async function getGlobalProductCount() {
  const summary = await getProductMasterSummary();
  return summary.totalProducts;
}

