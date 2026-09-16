import { useState, useEffect, useCallback } from 'react';
import { getProductMasterSummary } from '../services/productService';

// Module-level cache so simultaneous mounts share the latest fetched summary
let cachedSummary = null;
let activeFetchPromise = null;
const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(cachedSummary));
}

export function invalidateProductSummary() {
  cachedSummary = null;
  activeFetchPromise = null;
}

export async function fetchSharedProductSummary() {
  if (activeFetchPromise) return activeFetchPromise;
  activeFetchPromise = getProductMasterSummary()
    .then((result) => {
      cachedSummary = result;
      notifyListeners();
      return result;
    })
    .finally(() => {
      activeFetchPromise = null;
    });
  return activeFetchPromise;
}

/**
 * Shared React Hook for Global Product Master Summary
 * Single source of truth for total unique products/SKUs across:
 * - Dashboard
 * - Orders
 * - Allocation
 * - Picking
 * - Packing
 * - Dispatch
 */
export function useProductSummary() {
  const [data, setData] = useState(cachedSummary);
  const [loading, setLoading] = useState(!cachedSummary);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      invalidateProductSummary();
      const res = await fetchSharedProductSummary();
      setData(res);
    } catch (err) {
      setError(err?.message || 'Product data unavailable');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleUpdate = (latest) => {
      if (latest) {
        setData(latest);
        setLoading(false);
      }
    };

    listeners.add(handleUpdate);

    if (!cachedSummary) {
      refetch();
    } else {
      setData(cachedSummary);
      setLoading(false);
    }

    return () => {
      listeners.delete(handleUpdate);
    };
  }, [refetch]);

  return {
    totalProducts: data?.totalProducts ?? null,
    activeProducts: data?.activeProducts ?? null,
    totalSkus: data?.totalSkus ?? null,
    totalUnits: data?.totalUnits ?? null,
    warehouseUnits: data?.warehouseUnits ?? null,
    storeUnits: data?.storeUnits ?? null,
    loading,
    error,
    refetch,
  };
}
