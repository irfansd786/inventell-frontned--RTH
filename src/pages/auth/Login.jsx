import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Target,
  Activity,
  Layers,
  Calendar,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loading, authError } = useAuth();

  const [email, setEmail] = useState('admin@invintell.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      {/* Left Side: Store Photo Background + Text & Capability Icons */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 min-h-[600px] lg:min-h-screen">
        {/* Full-Height Store Background Image with Fade-in Motion */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/supermarket_4k_bg.jpg')` }}
        />
        {/* Dark Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />

        {/* 4. TOP-LEFT BRANDING */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 flex items-center gap-3 pt-2 pl-2"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md border border-emerald-400/30 shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-wider">INVINTELL</span>
              <span className="text-[9px] uppercase font-bold bg-emerald-600/90 text-white px-1.5 py-0.5 rounded tracking-wide shadow-xs">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">Intelligent Retail Analytics</p>
          </div>
        </motion.div>

        {/* 5. MAIN HERO TEXT & 6. BOTTOM FEATURE INDICATORS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative z-10 space-y-4 max-w-md pb-4 pt-12"
        >
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
            Smart Insights.<br />
            <span className="text-emerald-400">Better Decisions.</span>
          </h1>

          {/* Thin Divider Line */}
          <div className="w-16 h-0.5 bg-slate-500/60 my-2.5" />

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed drop-shadow-sm">
            AI-Powered Retail Intelligence<br />
            for Smarter Stores
          </p>

          {/* Second Thin Divider Line */}
          <div className="w-16 h-0.5 bg-slate-500/60 my-2.5" />

          {/* Capability Outline Icons (AI Analytics, Computer Vision, Inventory, Sales, Warehouse) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3 pt-1"
          >
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:border-emerald-500/60 shadow-md backdrop-blur-sm transition-colors" title="AI Analytics">
              <Target className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:border-emerald-500/60 shadow-md backdrop-blur-sm transition-colors" title="Computer Vision">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:border-emerald-500/60 shadow-md backdrop-blur-sm transition-colors" title="Inventory Intelligence">
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:border-emerald-500/60 shadow-md backdrop-blur-sm transition-colors" title="Sales Velocity">
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:border-emerald-500/60 shadow-md backdrop-blur-sm transition-colors" title="Warehouse Routing">
              <Settings className="w-4 h-4 text-emerald-400" />
            </div>
          </motion.div>

          {/* Sub Tagline */}
          <p className="text-xs text-slate-400 font-semibold tracking-widest pt-1 uppercase">
            Secure &bull; Reliable &bull; Intelligent
          </p>
        </motion.div>
      </div>

      {/* Right Side: Login Form (Matching src 2) */}
      <div className="lg:w-1/2 p-8 lg:p-14 flex flex-col justify-between items-center bg-white dark:bg-slate-900 transition-colors min-h-screen">
        <div className="w-full max-w-md my-auto space-y-6">
          {/* Centered Brand Header (Matching src 2) */}
          <div className="flex flex-col items-center text-center">
            {/* Green Shopping Cart Icon Box */}
            <div className="w-16 h-16 rounded-2xl border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mb-3 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
              <ShoppingCart className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-wider uppercase">
              INVINTELL
            </h1>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-tight mt-0.5">
              Intelligent Retail Analytics
            </p>
          </div>

          {/* Welcome Back Subheader */}
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Welcome Back!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sign in to continue to your account
            </p>
          </div>

          {/* Error Alert Display */}
          {(errorMsg || authError) && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in border ${
                (errorMsg || authError).toLowerCase().includes('inactive')
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300'
                  : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300'
              }`}
            >
              <Lock
                className={`w-4 h-4 shrink-0 ${
                  (errorMsg || authError).toLowerCase().includes('inactive') ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                }`}
              />
              <span>{errorMsg || authError}</span>
            </div>
          )}

          {/* Demo Credentials Quick Switcher (Functionality Preserved) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 text-xs space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-slate-900 dark:text-slate-100 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Prototype Credentials Switcher:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@invintell.com');
                  setPassword('admin123');
                }}
                className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('store@invintell.com');
                  setPassword('storeoperations123');
                }}
                className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Store Ops
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('inventory@invintell.com');
                  setPassword('inventory123');
                }}
                className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Inventory
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('warehouse@invintell.com');
                  setPassword('warehouse123');
                }}
                className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Warehouse
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('sales@invintell.com');
                  setPassword('salesbilling123');
                }}
                className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Sales & Billing
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('finance@invintell.com');
                  setPassword('reportsfinance123');
                }}
                className="px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-800 dark:text-slate-200 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
              >
                Reports & Finance
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@invintell.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-500 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                />
                Remember me
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Demo Credentials', 'Use admin@invintell.com / admin123 to log in.');
                }}
                className="text-blue-500 dark:text-blue-400 font-semibold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>

        {/* Copyright at Bottom Right (Matching src 2) */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center pt-6 pb-2">
          © {new Date().getFullYear()} INVINTELL. All rights reserved.
        </p>
      </div>
    </div>
  );
}

