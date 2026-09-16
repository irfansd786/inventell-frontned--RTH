import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, CheckCircle2, Shield, Bell, Cpu, Layout, Sliders } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import { settingsService } from '../../services/settingsService';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const s = await settingsService.getSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleToggleNotification = (key) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handleSave = async () => {
    await settingsService.saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = async () => {
    const res = await settingsService.resetSettings();
    setSettings(res);
  };

  if (loading || !settings) {
    return <LoadingState message="Loading platform configuration..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Platform Settings & System Configuration"
        subtitle="Configure store information, AI threshold parameters, real-time alert triggers, and dashboard preferences."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              {savedSuccess ? 'Settings Saved!' : 'Save Changes'}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Section A: General */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">A. General Store Info</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.general.storeName}
                onChange={(e) => setSettings({ ...settings, general: { ...settings.general, storeName: e.target.value } })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Address</label>
              <input
                type="text"
                value={settings.general.storeLocation}
                onChange={(e) => setSettings({ ...settings, general: { ...settings.general, storeLocation: e.target.value } })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={settings.general.currency}
                  readOnly
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={settings.general.timezone}
                  readOnly
                  className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section B: Dashboard */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layout className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">B. Command Center Preferences</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Workspace View</label>
              <select
                value={settings.dashboard.defaultView}
                onChange={(e) => setSettings({ ...settings, dashboard: { ...settings.dashboard, defaultView: e.target.value } })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="Command Center">Command Center Dashboard</option>
                <option value="Store Monitor">CCTV Live Monitor</option>
                <option value="Analytics">Retail Analytics</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Telemetry Refresh Interval</label>
              <select
                value={settings.dashboard.refreshIntervalSeconds}
                onChange={(e) => setSettings({ ...settings, dashboard: { ...settings.dashboard, refreshIntervalSeconds: Number(e.target.value) } })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value={5}>Every 5 seconds</option>
                <option value={15}>Every 15 seconds</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 1 minute</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section C: Notifications */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">C. Alert Triggers & Notifications</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <button
                  type="button"
                  onClick={() => handleToggleNotification(key)}
                  className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                    val ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section D: Intelligence Sliders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">D. AI & Risk Sensitivity Thresholds</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>AI Confidence Threshold</span>
                <strong className="text-emerald-600">{settings.intelligence.aiConfidenceThreshold}%</strong>
              </div>
              <input
                type="range"
                min="50"
                max="98"
                value={settings.intelligence.aiConfidenceThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  intelligence: { ...settings.intelligence, aiConfidenceThreshold: Number(e.target.value) }
                })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Risk Trigger Score Limit</span>
                <strong className="text-red-600">{settings.intelligence.riskAlertThreshold} / 100</strong>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                value={settings.intelligence.riskAlertThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  intelligence: { ...settings.intelligence, riskAlertThreshold: Number(e.target.value) }
                })}
                className="w-full accent-red-600"
              />
            </div>
          </div>
        </div>

        {/* Section F: System Status */}
        <div className="md:col-span-2 bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{settings.system.version}</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{settings.system.environment}</p>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-400">Data Pipeline Status:</span>
            <span className="font-bold text-emerald-400 block">{settings.system.dataStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
