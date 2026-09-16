import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Dashboard from '../pages/dashboard/Dashboard';
import LiveStoreMonitor from '../pages/monitoring/LiveStoreMonitor';

import CustomerAnalytics from '../pages/store-intelligence/CustomerAnalytics';
import Zone from '../pages/store-intelligence/Zone';
import Queues from '../pages/store-intelligence/Queues';
import Shelves from '../pages/store-intelligence/Shelves';

import Billing from '../pages/sales/Billing';
import Inventory from '../pages/inventory/Inventory';
import Products from '../pages/inventory/Products';
import LowStock from '../pages/inventory/LowStock';
import Forecasting from '../pages/inventory/Forecasting';

import Orders from '../pages/warehouse/Orders';
import Allocation from '../pages/warehouse/Allocation';
import Picking from '../pages/warehouse/Picking';
import Packing from '../pages/warehouse/Packing';
import Dispatch from '../pages/warehouse/Dispatch';
import Transfers from '../pages/warehouse/Transfers';
import Warehouse from '../pages/warehouse/Warehouse';
import Suppliers from '../pages/warehouse/Suppliers';

import Analytics from '../pages/intelligence/Analytics';
import Risks from '../pages/intelligence/Risks';
import AIInsights from '../pages/intelligence/AIInsights';
import Alerts from '../pages/intelligence/Alerts';
import Exceptions from '../pages/intelligence/Exceptions';
import ManagementActions from '../pages/intelligence/ManagementActions';
import ScenarioSimulation from '../pages/intelligence/ScenarioSimulation';
import ActivityLog from '../pages/intelligence/ActivityLog';
import Reports from '../pages/intelligence/Reports';
import Finance from '../pages/intelligence/Finance';
import Staff from '../pages/intelligence/Staff';
import FutureRoadmap from '../pages/intelligence/FutureRoadmap';
import Settings from '../pages/intelligence/Settings';

import AppLayout from '../components/layout/AppLayout';
import { ProtectedRoute, PermissionRoute } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export default function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Login Route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Command Center */}
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/monitoring" element={<PermissionRoute permission="store_monitor"><AppLayout><LiveStoreMonitor /></AppLayout></PermissionRoute>} />

      {/* Store Intelligence Module Routes */}
      <Route path="/customer-analytics" element={<PermissionRoute permission="customer_analytics"><AppLayout><CustomerAnalytics /></AppLayout></PermissionRoute>} />
      <Route path="/zone" element={<PermissionRoute permission="spatial_intelligence"><AppLayout><Zone /></AppLayout></PermissionRoute>} />
      <Route path="/zones" element={<Navigate to="/zone" replace />} />
      <Route path="/heatmap" element={<Navigate to="/zone" replace />} />
      <Route path="/spatial-intelligence" element={<Navigate to="/zone" replace />} />
      <Route path="/queues" element={<PermissionRoute permission="queue_intelligence"><AppLayout><Queues /></AppLayout></PermissionRoute>} />
      <Route path="/queue-intelligence" element={<Navigate to="/queues" replace />} />
      <Route path="/shelves" element={<PermissionRoute permission="inventory"><AppLayout><Shelves /></AppLayout></PermissionRoute>} />
      <Route path="/shelf-intelligence" element={<Navigate to="/shelves" replace />} />

      {/* Sales & Inventory Module Routes */}
      <Route path="/billing" element={<PermissionRoute permission="billing_sales"><AppLayout><Billing /></AppLayout></PermissionRoute>} />
      <Route path="/sales" element={<PermissionRoute permission="billing_sales"><AppLayout><Billing /></AppLayout></PermissionRoute>} />
      <Route path="/inventory" element={<PermissionRoute permission="inventory"><AppLayout><Inventory /></AppLayout></PermissionRoute>} />
      <Route path="/products" element={<Navigate to="/inventory" replace />} />
      <Route path="/low-stock" element={<PermissionRoute permission="low_stock"><AppLayout><LowStock /></AppLayout></PermissionRoute>} />
      <Route path="/forecasting" element={<PermissionRoute permission="forecasting"><AppLayout><Forecasting /></AppLayout></PermissionRoute>} />

      {/* Warehouse Operations Module Routes */}
      <Route path="/orders" element={<PermissionRoute permission="orders"><AppLayout><Orders /></AppLayout></PermissionRoute>} />
      <Route path="/allocation" element={<PermissionRoute permission="allocation"><AppLayout><Allocation /></AppLayout></PermissionRoute>} />
      <Route path="/picking" element={<PermissionRoute permission="picking"><AppLayout><Picking /></AppLayout></PermissionRoute>} />
      <Route path="/packing" element={<PermissionRoute permission="packing"><AppLayout><Packing /></AppLayout></PermissionRoute>} />
      <Route path="/dispatch" element={<PermissionRoute permission="dispatch"><AppLayout><Dispatch /></AppLayout></PermissionRoute>} />
      <Route path="/transfers" element={<Navigate to="/allocation" replace />} />
      <Route path="/warehouse" element={<Navigate to="/allocation" replace />} />
      <Route path="/suppliers" element={<PermissionRoute permission="inventory"><AppLayout><Suppliers /></AppLayout></PermissionRoute>} />

      {/* Intelligence & Control Layer Routes */}
      <Route path="/analytics" element={<PermissionRoute permission="ai_insights"><AppLayout><Analytics /></AppLayout></PermissionRoute>} />
      <Route path="/risks" element={<Navigate to="/alerts" replace />} />
      <Route path="/ai-insights" element={<PermissionRoute permission="ai_insights"><AppLayout><AIInsights /></AppLayout></PermissionRoute>} />
      <Route path="/alerts" element={<PermissionRoute permission="alerts"><AppLayout><Alerts /></AppLayout></PermissionRoute>} />
      <Route path="/exceptions" element={<PermissionRoute permission="exceptions"><AppLayout><Exceptions /></AppLayout></PermissionRoute>} />
      <Route path="/management-actions" element={<Navigate to="/exceptions" replace />} />
      <Route path="/scenario-simulation" element={<PermissionRoute permission="ai_insights"><AppLayout><ScenarioSimulation /></AppLayout></PermissionRoute>} />

      {/* Reporting & Staff Routes */}
      <Route path="/activity-log" element={<PermissionRoute permission="staff"><AppLayout><ActivityLog /></AppLayout></PermissionRoute>} />
      <Route path="/reports" element={<PermissionRoute permission="report_center"><AppLayout><Reports /></AppLayout></PermissionRoute>} />
      <Route path="/finance" element={<PermissionRoute permission="finance"><AppLayout><Finance /></AppLayout></PermissionRoute>} />
      <Route path="/staff" element={<PermissionRoute permission="staff"><AppLayout><Staff /></AppLayout></PermissionRoute>} />
      <Route path="/future" element={<ProtectedRoute><AppLayout><FutureRoadmap /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />

      {/* Fallback Catch-all Route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
