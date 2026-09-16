import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import ShelfHeader from '../../components/store-intelligence/shelf/ShelfHeader';
import ShelfKpiRow from '../../components/store-intelligence/shelf/ShelfKpiRow';
import ShelfIntelligenceMap from '../../components/store-intelligence/shelf/ShelfIntelligenceMap';
import ShelfStatusPanel from '../../components/store-intelligence/shelf/ShelfStatusPanel';
import ProductShelfTable from '../../components/store-intelligence/shelf/ProductShelfTable';
import ShelfAnalyticsCharts from '../../components/store-intelligence/shelf/ShelfAnalyticsCharts';
import AiShelfInsight from '../../components/store-intelligence/shelf/AiShelfInsight';
import ShelfRecommendations from '../../components/store-intelligence/shelf/ShelfRecommendations';
import { getShelfIntelligenceData, replenishShelfProduct } from '../../services/shelfService';

export default function Shelves() {
  const [selectedAisle, setSelectedAisle] = useState('aisle-01');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusLabel, setStatusLabel] = useState('ANALYSIS RUNNING');
  const [dataProvenance, setDataProvenance] = useState('Database Inventory + CCTV Tracking');

  // Bays and Products state
  const [bays, setBays] = useState([]);
  const [products, setProducts] = useState([]);
  const [people, setPeople] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [categoryRisk, setCategoryRisk] = useState([]);

  // KPI metrics
  const [metrics, setMetrics] = useState({
    shelvesMonitored: 4,
    shelvesMonitoredSub: 'Monitored store aisles',
    lowStockItems: 0,
    lowStockSub: 'Calculated from inventory',
    emptySlots: null,
    emptySlotsLabel: 'Awaiting shelf detection',
    emptySlotsSub: 'YOLO COCO Person Only • Shelf CV Pending',
    shelfHealth: '0%',
    shelfHealthSub: 'Calculated from inventory',
    stockoutRisk: 'LOW',
    stockoutRiskSub: 'Demand vs store stock',
  });

  const [aiInsight, setAiInsight] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getShelfIntelligenceData('camera_02');
      setStatusLabel(res.statusLabel);
      setDataProvenance(res.dataProvenance);
      if (res.kpis) {
        setMetrics(res.kpis);
      }
      setBays(res.shelfBays || []);
      setProducts(res.productsTable || []);
      setPeople(res.people || []);
      setActivityData(res.activityTrend || []);
      setCategoryRisk(res.categoryRisk || []);
      setAiInsight(res.aiInsight);
      setRecommendations(res.recommendations || []);
    } catch (e) {
      console.warn('Shelf telemetry fallback applied:', e);
      setStatusLabel('DATA UNAVAILABLE');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Real Database Replenishment Handler:
  // Executes POST /inventory/replenish to shift units from warehouse to store stock
  const handleRestock = async (targetProduct) => {
    const productId = targetProduct?.product_id || (typeof targetProduct === 'number' ? targetProduct : 1);
    try {
      await replenishShelfProduct(productId, 10);
      // Reload fresh SQLite database data to immediately reflect updated stock
      await loadData();
    } catch (err) {
      console.error('Replenishment failed:', err);
    }
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Product,SKU,Location,FacingCount,MaxFacing,Interactions,WarehouseStock,Risk,Status\n' +
      products
        .map(
          (p) =>
            `"${p.name}","${p.sku}","${p.location}",${p.facingCount},${p.maxFacing},${p.interactions},${p.warehouseStock},"${p.risk}","${p.status}"`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Shelf_Intelligence_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageContainer className="space-y-3 sm:space-y-3.5">
      {/* 1. Header (Compact 56-64px) */}
      <ShelfHeader
        selectedAisle={selectedAisle}
        onAisleChange={setSelectedAisle}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onRefresh={loadData}
        onExport={handleExport}
        isRefreshing={isRefreshing}
        statusLabel={statusLabel}
        dataProvenance={dataProvenance}
      />

      {/* 2. KPI Metrics Bar (5 exact metrics) */}
      <ShelfKpiRow metrics={metrics} />

      {/* 3. Main Analysis Section (70% CCTV / 30% Shelf Bay Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3.5 items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <ShelfIntelligenceMap
            cameraId="camera_02"
            cameraLabel="CAM-02 • Overhead Aisle View"
            bays={bays}
            products={products}
            people={people}
            statusLabel={statusLabel}
            dataProvenance={dataProvenance}
            onRestock={handleRestock}
          />
        </div>
        <div className="lg:col-span-3 flex flex-col">
          <ShelfStatusPanel
            bays={bays}
            onRequestRestock={(bayId) => {
              // Target first low-stock product
              const target = products.find((p) => p.risk === 'CRITICAL' || p.risk === 'HIGH') || products[0];
              if (target) handleRestock(target);
            }}
          />
        </div>
      </div>

      {/* 4. Product-Level Shelf Inventory Table */}
      <ProductShelfTable
        products={products}
        onRestock={handleRestock}
      />

      {/* 5. Shelf Analytics Charts Section */}
      <ShelfAnalyticsCharts
        activityData={activityData}
        categoryRisk={categoryRisk}
      />

      {/* 6. AI Operational Shelf Insight Card */}
      <AiShelfInsight
        insight={aiInsight}
        onDispatchRunner={() => {
          const target = products.find((p) => p.risk === 'CRITICAL' || p.risk === 'HIGH') || products[0];
          if (target) handleRestock(target);
        }}
      />

      {/* 7. Autonomous Replenishment Recommendations */}
      <ShelfRecommendations
        recommendations={recommendations}
        onAction={(id, rec) => {
          const target = products.find((p) => p.risk === 'CRITICAL' || p.risk === 'HIGH') || products[0];
          if (target) handleRestock(target);
        }}
      />
    </PageContainer>
  );
}
