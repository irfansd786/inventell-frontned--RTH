import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Store,
  Bell,
  HelpCircle,
  Menu,
  Clock,
  Calendar,
  Sun,
  Moon,
  LogOut,
  Settings,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { STORE_INFO } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import Modal from '../common/Modal';
import { apiGet } from '../../services/api';

export default function Topbar() {
  const navigate = useNavigate();
  const { user, profile, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggle: onToggleSidebar } = useSidebar();
  const [time, setTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleLogout = async () => {
    setShowProfile(false);
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };
  const [notifList, setNotifList] = useState([
    {
      id: 'notif-system',
      title: 'Store Intelligence Active',
      description: 'AI vision and multi-camera telemetry running normally.',
      time: 'Just now',
      read: false,
      link: '/monitoring',
    },
  ]);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close popovers on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Load notifications from the backend alert feed (polled every 5s for operational alerts)
  useEffect(() => {
    let cancelled = false;
    const fetchAlerts = () => {
      apiGet('/alerts?limit=8')
        .then((data) => {
          if (!cancelled) setNotifList(Array.isArray(data) ? data : data?.items || []);
        })
        .catch(() => {
          if (!cancelled && notifList.length === 0) setNotifList([]);
        });
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend-powered global search (products + orders). Debounced.
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const q = encodeURIComponent(searchQuery.trim());
        const [products, orders] = await Promise.all([
          apiGet(`/products?q=${q}&limit=5`).catch(() => []),
          apiGet(`/orders?q=${q}&limit=5`).catch(() => ({ items: [] })),
        ]);
        const prodHits = (Array.isArray(products) ? products : products?.items || []).map((p) => ({
          title: `${p.name} (${p.sku})`,
          category: 'Product',
          path: '/inventory',
        }));
        const ordHits = (orders?.items || []).map((o) => ({
          title: `Order ${o.order_number || o.id} — ${o.status}`,
          category: 'Order',
          path: '/orders',
        }));
        setSearchResults([...prodHits, ...ordHits]);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const unreadCount = notifList.filter((n) => !n.read && !n.is_read).length;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-3">
        {/* LEFT: sidebar toggle + brand */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle sidebar"
            title="Collapse / expand sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="leading-tight">
            <p className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              INVINTELL
              <span className="text-[9px] uppercase font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                ENTERPRISE
              </span>
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Retail Intelligence
            </p>
          </div>
        </div>

        {/* CENTER: global search */}
        <div className="relative flex-1 max-w-xl hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orders..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
          {(searchResults.length > 0 || (searching && searchQuery)) && (
            <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 max-h-72 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 dark:border-slate-700">
                {searching ? 'Searching...' : `Results (${searchResults.length})`}
              </div>
              {searchResults.length === 0 && !searching && (
                <p className="p-3 text-xs text-slate-500">No matches found.</p>
              )}
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      navigate(res.path);
                      setSearchQuery('');
                    }}
                    className="p-2.5 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{res.title}</span>
                    <span className="text-[10px] font-bold bg-emerald-50 dark:bg-slate-700 px-2 py-0.5 rounded text-emerald-700 dark:text-slate-300">
                      {res.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: store, date/time, notifications, theme, profile — uniform across whole site */}
        <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
          {/* Store status pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 bg-[#ecfdf5] dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <Store className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{STORE_INFO.name}</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{STORE_INFO.status || 'Operational'}</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-700 dark:text-slate-200 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Action icons: Help, Notifications, Theme */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Help & Info"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Notifications & Alerts</h4>
                    <span className="text-[10px] bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount || notifList.length} Unread
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-64 overflow-y-auto text-xs">
                    {notifList.length === 0 && (
                      <p className="p-4 text-slate-500 dark:text-slate-400 text-center">No notifications.</p>
                    )}
                    {notifList.map((ntf, i) => (
                      <div
                        key={ntf.id || i}
                        onClick={() => {
                          navigate(ntf.relatedModule || ntf.link || '/alerts');
                          setShowNotifications(false);
                        }}
                        className="p-3 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                          <p className="font-semibold text-slate-800 dark:text-slate-100 flex-1">{ntf.title}</p>
                          <span className="text-[9px] text-slate-400">{ntf.time || ntf.created_at}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 pl-3.5">
                          {ntf.description || ntf.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-amber-300 hover:text-emerald-700 dark:hover:text-amber-200 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(profile?.name || user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                  {profile?.name || user?.displayName || user?.email || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase leading-tight">
                  {profile?.role || (isAdmin ? 'ADMIN' : 'EMPLOYEE')}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {profile?.name || user?.displayName || user?.email || 'User'}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    {profile?.role || (isAdmin ? 'ADMIN' : 'EMPLOYEE')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {user?.email || profile?.email || ''}
                  </p>
                </div>
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate('/staff');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700"
                  >
                    <UserIcon className="w-3.5 h-3.5" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfile(false);
                      navigate('/settings');
                    }}
                    className="w-full px-4 py-2 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="INVINTELL Platform Overview">
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-medium text-slate-800 dark:text-slate-100">
            Welcome to INVINTELL — Intelligent Retail Analytics System.
          </p>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-emerald-900 dark:text-emerald-300 space-y-1">
            <p className="font-semibold">Intelligence Flow Architecture:</p>
            <p>
              DETECT (CCTV) → UNDERSTAND (Customer Dwell) → CORRELATE (Billing) → PREDICT (Demand Forecasting) → RECOMMEND (AI Insights) → ACT (Warehouse Dispatch)
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
