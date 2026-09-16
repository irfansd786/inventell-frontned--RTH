import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Shield, Check, AlertCircle, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import { MODULE_GROUPS, ALL_PERMISSION_IDS } from '../../config/permissions';
import { staffService } from '../../services/staffService';
import { useToast } from '../../context/ToastContext';

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onEmployeeCreated,
  currentCount = 0,
  maxEmployees = 0,
}) {
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [status, setStatus] = useState('active');
  const [showPassword, setShowPassword] = useState(false);
  const [assignedModules, setAssignedModules] = useState(['store_monitor', 'customer_analytics', 'alerts']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isLimitReached = false;

  const handleToggleModule = (moduleId) => {
    setAssignedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleToggleGroup = (group) => {
    const groupModuleIds = group.modules.map((m) => m.id);
    const allSelected = groupModuleIds.every((id) => assignedModules.includes(id));
    if (allSelected) {
      setAssignedModules((prev) => prev.filter((id) => !groupModuleIds.includes(id)));
    } else {
      setAssignedModules((prev) => Array.from(new Set([...prev, ...groupModuleIds])));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Employee name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('A valid email address is required.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Temporary password must be at least 6 characters.');
      return;
    }
    if (assignedModules.length === 0) {
      setErrorMsg('Please select at least one assigned operational module.');
      return;
    }

    setLoading(true);
    try {
      const payloadModules = role === 'admin' ? ALL_PERMISSION_IDS : assignedModules;
      const created = await staffService.createEmployee({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        status,
        assigned_modules: payloadModules,
      });

      toast.success('Account Created', `Employee ${name} registered in Firebase Auth and roster.`);
      if (onEmployeeCreated) onEmployeeCreated(created);

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setAssignedModules(['store_monitor', 'customer_analytics', 'alerts']);
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to create employee account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Basic Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employee Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corporate Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@invintell.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Password, Role, and Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 chars"
                className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
            >
              <option value="employee">Employee</option>
              <option value="admin">Administrator (Full Access)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Assigned Operational Work */}
        {role === 'admin' ? (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300">
            <span className="font-bold">Full Platform Privileges:</span> Administrators automatically receive unrestricted access to every platform module, configuration console, and staff controls.
          </div>
        ) : (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Assigned Work & Permissions</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select the operational modules this employee is authorized to access.
                </p>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {assignedModules.length} selected
              </span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {MODULE_GROUPS.map((group) => {
                const groupModuleIds = group.modules.map((m) => m.id);
                const allSelected = groupModuleIds.every((id) => assignedModules.includes(id));
                const someSelected = groupModuleIds.some((id) => assignedModules.includes(id));

                return (
                  <div
                    key={group.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide text-[10px]">
                        {group.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleGroup(group)}
                        className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {allSelected ? 'Deselect Group' : 'Select Group'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {group.modules.map((mod) => {
                        const checked = assignedModules.includes(mod.id);
                        return (
                          <label
                            key={mod.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                              checked
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-semibold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleModule(mod.id)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="truncate">{mod.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Employee...
              </>
            ) : (
              'Create Employee'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
