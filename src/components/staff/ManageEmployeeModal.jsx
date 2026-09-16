import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Power,
  PowerOff,
  Save,
  KeyRound,
  Trash2,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import Modal from '../common/Modal';
import { MODULE_GROUPS, MODULE_MAP } from '../../config/permissions';
import { staffService } from '../../services/staffService';
import { useToast } from '../../context/ToastContext';

export default function ManageEmployeeModal({
  isOpen,
  onClose,
  employee,
  onEmployeeUpdated,
  onEmployeeDeleted,
}) {
  const { toast } = useToast();

  const [assignedModules, setAssignedModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sub-modal confirmation states
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (employee) {
      setAssignedModules(Array.isArray(employee.assigned_modules) ? [...employee.assigned_modules] : []);
      setErrorMsg('');
      setShowDisableConfirm(false);
      setShowActivateConfirm(false);
      setShowDeleteConfirm(false);
    }
  }, [employee]);

  if (!employee) return null;

  const isAdmin = employee.role?.toLowerCase() === 'admin';
  const isActive = employee.status?.toLowerCase() === 'active';
  const uid = employee.uid || employee.id;

  const demoPasswords = {
    'admin@invintell.com': 'admin123',
    'store@invintell.com': 'storeoperations123',
    'inventory@invintell.com': 'inventory123',
    'warehouse@invintell.com': 'warehouse123',
    'sales@invintell.com': 'salesbilling123',
    'finance@invintell.com': 'reportsfinance123',
  };
  const visiblePassword = employee.email ? demoPasswords[employee.email.toLowerCase()] || 'Password reset required' : 'Password reset required';

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

  // 1. Save access changes
  const handleSavePermissions = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const updated = await staffService.updatePermissions(uid, assignedModules);
      toast.success('Access Changes Saved', `Operational permissions for ${employee.name} updated successfully.`);
      if (onEmployeeUpdated) {
        onEmployeeUpdated(updated || { ...employee, assigned_modules: assignedModules });
      }
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to update employee permissions.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Disable Account
  const handleConfirmDisable = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const updated = await staffService.deactivateEmployee(uid);
      toast.info('Account Disabled', `${employee.name} has been deactivated and cannot access INVINTELL.`);
      if (onEmployeeUpdated) {
        onEmployeeUpdated(updated || { ...employee, status: 'inactive' });
      }
      setShowDisableConfirm(false);
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to disable account.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Activate Account
  const handleConfirmActivate = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const updated = await staffService.activateEmployee(uid);
      toast.success('Account Activated', `${employee.name} is now active and can log in.`);
      if (onEmployeeUpdated) {
        onEmployeeUpdated(updated || { ...employee, status: 'active' });
      }
      setShowActivateConfirm(false);
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to activate account.');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Send Password Reset
  const handleSendPasswordReset = async () => {
    setResetLoading(true);
    setErrorMsg('');
    try {
      await staffService.sendPasswordReset(uid);
      toast.success('Password Reset Sent', `Password reset instructions sent to ${employee.email}.`);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to trigger password reset.');
    } finally {
      setResetLoading(false);
    }
  };

  // 5. Delete Employee
  const handleConfirmDelete = async () => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      await staffService.deleteEmployee(uid);
      toast.success('Employee Deleted', `${employee.name} has been permanently deleted.`);
      if (onEmployeeDeleted) {
        onEmployeeDeleted(uid);
      }
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to delete employee account.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Employee" maxWidth="max-w-2xl">
        <div className="space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section: Employee Information */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white font-black text-base flex items-center justify-center shrink-0">
                  {(employee.name || 'E').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {employee.name}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-red-50 dark:bg-red-500/15 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{employee.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold uppercase">
                  Role: {employee.role || 'Employee'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
              <div>
                <span className="font-semibold block text-slate-400">Firebase UID:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200 text-[10px] truncate block" title={employee.uid}>
                  {employee.uid ? `${employee.uid.slice(0, 14)}...` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-semibold block text-slate-400">Created Date:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-semibold block text-slate-400">Last Login:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {employee.last_login
                    ? employee.last_login.includes('T')
                      ? new Date(employee.last_login).toLocaleString()
                      : employee.last_login
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Credentials</h4>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Visible to admin</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Email</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] break-all">{employee.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Password</label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] flex-1 break-all">
                    {showPassword ? visiblePassword : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {visiblePassword === 'Password reset required'
                    ? 'This staff member has no known demo password on file. Use password reset to create a new one.'
                    : 'Click the eye icon to reveal the password for this staff member.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section: Access & Assigned Work */}
          {isAdmin ? (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-800 dark:text-emerald-300">
              <span className="font-bold">Administrator Account:</span> Administrators have full platform access across all consoles and features.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Assigned Work & Permissions</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Select operational modules for this employee. Only Admin can assign permissions.
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] text-slate-600 dark:text-slate-300">
                  {assignedModules.length} assigned
                </span>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {MODULE_GROUPS.map((group) => {
                  const groupModuleIds = group.modules.map((m) => m.id);
                  const allSelected = groupModuleIds.every((id) => assignedModules.includes(id));

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
                          className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
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
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
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

          {/* Section: Account Status & Actions */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/70 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">Account Control</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Manage active status, trigger password reset, or delete account.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
              {/* Disable / Activate Account Button */}
              {!isAdmin && (
                isActive ? (
                  <button
                    type="button"
                    onClick={() => setShowDisableConfirm(true)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Disable Account</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowActivateConfirm(true)}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Activate Account</span>
                  </button>
                )
              )}

              {/* Send Password Reset Button */}
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={resetLoading}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{resetLoading ? 'Sending...' : 'Send Password Reset'}</span>
              </button>

              {/* Delete Employee Button (Destructive, Visually Separated) */}
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="ml-auto px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Employee</span>
                </button>
              )}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {!isAdmin && (
              <button
                type="button"
                onClick={handleSavePermissions}
                disabled={loading}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Access Changes</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal: Disable Account */}
      {showDisableConfirm && (
        <Modal
          isOpen={showDisableConfirm}
          onClose={() => setShowDisableConfirm(false)}
          title="Disable Employee Account?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{employee.name} will no longer be able to access INVINTELL.</p>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  The account status will become inactive. Existing historical records, activity logs, and orders will remain preserved.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDisableConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisable}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {actionLoading ? 'Disabling...' : 'Disable Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Activate Account */}
      {showActivateConfirm && (
        <Modal
          isOpen={showActivateConfirm}
          onClose={() => setShowActivateConfirm(false)}
          title="Activate Employee Account?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{employee.name} will regain access to INVINTELL.</p>
                <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                  The account will be restored to active status and the employee will be able to log in with their existing credentials.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowActivateConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActivate}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {actionLoading ? 'Activating...' : 'Activate Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Modal: Delete Employee */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Employee?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">This will permanently remove this employee's account from INVINTELL.</p>
                <p className="text-[11px] text-red-700 mt-1 leading-relaxed">
                  The Firebase user will be deleted and the employee capacity will free up (e.g. 4 / 5). Historical audit logs will be safely archived. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {actionLoading ? 'Deleting...' : 'Delete Employee'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

