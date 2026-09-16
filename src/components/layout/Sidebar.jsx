import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  Users,
  Grid,
  Clock,
  Layers,
  ShoppingBag,
  Package,
  Boxes,
  AlertTriangle,
  TrendingUp,
  Truck,
  ArrowRightLeft,
  Warehouse,
  BarChart2,
  ShieldAlert,
  Sparkles,
  Brain,
  Bell,
  Sliders,
  FileText,
  FileSpreadsheet,
  DollarSign,
  UserCheck,
  Rocket,
  Settings,
  ShoppingCart,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ isOpen, setIsOpen, collapsed = false }) {
  const location = useLocation();
  const { logout, user, profile, isAdmin, hasPermission } = useAuth();

  // On mobile the drawer always shows the full navigation, even if the
  // desktop rail is collapsed.
  const effectiveCollapsed = collapsed && !isOpen;

  const rawNavGroups = [
    {
      title: 'COMMAND CENTER',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'STORE INTELLIGENCE',
      items: [
        { name: 'Live Store Monitor', path: '/monitoring', icon: Video, permission: 'store_monitor' },
        { name: 'Customer Analytics', path: '/customer-analytics', icon: Users, permission: 'customer_analytics' },
        { name: 'Spatial Intelligence', path: '/zone', icon: Grid, permission: 'spatial_intelligence' },
        { name: 'Queue Intelligence', path: '/queues', icon: Clock, permission: 'queue_intelligence' },
      ],
    },
    {
      title: 'SALES & INVENTORY',
      items: [
        { name: 'Billing & Sales', path: '/billing', icon: ShoppingBag, permission: 'billing_sales' },
        { name: 'Inventory', path: '/inventory', icon: Package, permission: 'inventory' },
        { name: 'Low Stock', path: '/low-stock', icon: AlertTriangle, permission: 'low_stock' },
        { name: 'Forecasting', path: '/forecasting', icon: TrendingUp, permission: 'forecasting' },
      ],
    },
    {
      title: 'WAREHOUSE OPERATIONS',
      items: [
        { name: 'Orders', path: '/orders', icon: ShoppingCart, permission: 'orders' },
        { name: 'Allocation', path: '/allocation', icon: Layers, permission: 'allocation' },
        { name: 'Picking', path: '/picking', icon: Boxes, permission: 'picking' },
        { name: 'Packing', path: '/packing', icon: Package, permission: 'packing' },
        { name: 'Dispatch', path: '/dispatch', icon: Truck, permission: 'dispatch' },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { name: 'AI Insights', path: '/ai-insights', icon: Brain, permission: 'ai_insights' },
        { name: 'Alerts', path: '/alerts', icon: Bell, permission: 'alerts' },
        { name: 'Exceptions', path: '/exceptions', icon: AlertTriangle, permission: 'exceptions' },
      ],
    },
    {
      title: 'REPORTING & STAFF',
      items: [
        { name: 'Finance', path: '/finance', icon: DollarSign, permission: 'finance' },
        { name: 'Staff', path: '/staff', icon: UserCheck, permission: 'staff' },
        { name: 'Report Center', path: '/reports', icon: FileSpreadsheet, permission: 'report_center' },
      ],
    },
  ];

  // Filter groups and items based on enterprise role permissions
  const navGroups = rawNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
        />
      )}

      {/* In-flow flex item on desktop (sticky), overlay drawer on mobile. */}
      <aside
        className={`sidebar-shell fixed lg:sticky top-0 left-0 z-40 flex h-screen flex-shrink-0 flex-col overflow-hidden bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-800 w-[240px] ${
          effectiveCollapsed ? 'lg:w-[70px]' : 'lg:w-[240px]'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Brand Header */}
        <div className={`p-4 border-b border-slate-800 flex items-center ${effectiveCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 shrink-0 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow">
            <ShoppingCart className="w-5 h-5" />
          </div>
          {!effectiveCollapsed && (
            <div className="whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-wider">INVINTELL</span>
                <span className="text-[9px] uppercase font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Intelligent Retail Platform</p>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <div className={`flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-5 ${effectiveCollapsed ? 'px-2' : 'px-3'}`}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!effectiveCollapsed && (
                <h4 className="px-3 text-[10px] font-bold text-slate-500 tracking-wider uppercase whitespace-nowrap">
                  {group.title}
                </h4>
              )}
              <div className="space-y-0.5 mt-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/zone'
                      ? location.pathname === '/zone' ||
                        location.pathname === '/zones' ||
                        location.pathname === '/heatmap' ||
                        location.pathname === '/spatial-intelligence'
                      : item.path === '/queues'
                      ? location.pathname === '/queues' ||
                        location.pathname === '/queue-intelligence'
                      : item.path === '/shelves'
                      ? location.pathname === '/shelves' ||
                        location.pathname === '/shelf-intelligence'
                      : location.pathname === item.path;

                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      title={effectiveCollapsed ? item.name : undefined}
                      className={`group relative flex items-center rounded-lg text-xs font-medium transition-colors ${
                        effectiveCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3 py-1.5'
                      } ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className={`flex items-center ${effectiveCollapsed ? '' : 'gap-2.5'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        {!effectiveCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                      </div>
                      {!effectiveCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                      {/* Hover tooltip when collapsed */}
                      {effectiveCollapsed && (
                        <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-50">
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer User Info */}
        <div className="p-3 border-t border-slate-800 bg-black/30 flex items-center justify-between">
          <div
            className={`flex items-center gap-2.5 overflow-hidden ${effectiveCollapsed ? 'justify-center w-full' : ''}`}
            title={effectiveCollapsed ? `${profile?.name || user?.email} (${profile?.role || 'EMPLOYEE'})` : undefined}
          >
            <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
              {(profile?.name || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            {!effectiveCollapsed && (
              <div className="truncate whitespace-nowrap">
                <p className="text-xs font-semibold text-white truncate">{profile?.name || user?.displayName || user?.email}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase truncate">{profile?.role || (isAdmin ? 'ADMIN' : 'EMPLOYEE')}</p>
              </div>
            )}
          </div>
          {!effectiveCollapsed && (
            <button
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
