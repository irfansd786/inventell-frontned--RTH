import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Shield,
  Search,
  Plus,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Mail,
  Clock,
  ChevronDown,
  X,
  Settings,
  Layers,
  Sparkles,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import AddEmployeeModal from '../../components/staff/AddEmployeeModal';
import ManageEmployeeModal from '../../components/staff/ManageEmployeeModal';
import { staffService } from '../../services/staffService';
import { MODULE_MAP, ALL_MODULES } from '../../config/permissions';
import { useToast } from '../../context/ToastContext';

export default function Staff() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const fetchStaffData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await staffService.getStaff();
      if (res) {
        setStaff(Array.isArray(res.items) ? res.items : []);
        if (res.summary) {
          setSummary(res.summary);
        } else {
          const total = (res.items || []).length;
          const active = (res.items || []).filter((s) => s.status === 'active').length;
          setSummary({ total, active, inactive: total - active });
        }
      }
    } catch (err) {
      console.error('Failed to load staff roster', err);
      toast.error('Error', 'Unable to retrieve employee roster.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStaffData();
  }, [fetchStaffData]);

  // Recalculate summary from local state when updates happen
  const updateSummaryFromStaff = (updatedStaff) => {
    const total = updatedStaff.length;
    const active = updatedStaff.filter((s) => s.status?.toLowerCase() === 'active').length;
    setSummary({ total, active, inactive: total - active });
  };

  const handleEmployeeCreated = (newEmp) => {
    setStaff((prev) => {
      const next = [newEmp, ...prev];
      updateSummaryFromStaff(next);
      return next;
    });
  };

  const handleEmployeeUpdated = (updated) => {
    setStaff((prev) => {
      const next = prev.map((e) =>
        e.uid === updated.uid || String(e.id) === String(updated.id || updated.uid) ? { ...e, ...updated } : e
      );
      updateSummaryFromStaff(next);
      return next;
    });
  };

  const handleEmployeeDeleted = (deletedUid) => {
    setStaff((prev) => {
      const next = prev.filter(
        (e) => e.uid !== deletedUid && String(e.id) !== String(deletedUid)
      );
      updateSummaryFromStaff(next);
      return next;
    });
  };

  // Filtered staff memo
  const filteredStaff = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return staff.filter((emp) => {
      // Status filter
      if (statusFilter !== 'ALL' && emp.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Role filter
      if (roleFilter !== 'ALL' && emp.role?.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }

      // Module filter
      if (moduleFilter !== 'ALL') {
        const isAdmin = emp.role?.toLowerCase() === 'admin';
        const hasModule = Array.isArray(emp.assigned_modules) && emp.assigned_modules.includes(moduleFilter);
        if (!isAdmin && !hasModule) {
          return false;
        }
      }

      // Search query (name, email, role, or module titles)
      if (q) {
        const nameMatch = emp.name?.toLowerCase().includes(q);
        const emailMatch = emp.email?.toLowerCase().includes(q);
        const roleMatch = emp.role?.toLowerCase().includes(q);
        const moduleMatch = (emp.assigned_modules || []).some((mId) => {
          const mod = MODULE_MAP[mId];
          return mod?.name?.toLowerCase().includes(q) || mId.toLowerCase().includes(q);
        });

        if (!nameMatch && !emailMatch && !roleMatch && !moduleMatch) {
          return false;
        }
      }

      return true;
    });
  }, [staff, searchQuery, statusFilter, roleFilter, moduleFilter]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'ALL' || roleFilter !== 'ALL' || moduleFilter !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setRoleFilter('ALL');
    setModuleFilter('ALL');
  };

  if (loading) {
    return <LoadingState message="Loading staff directory & access permissions..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <PageHeader
        title="Staff Management"
        subtitle="Manage employees, permissions and account status."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStaffData(true)}
              disabled={refreshing}
              className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Refresh staff roster"
            >
              <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Employee</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Employees
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {summary.total}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Active employee roster
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Active Employees
            </span>
            <div className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1 flex items-center gap-2">
              {summary.active}
              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 mt-0.5">
              Authorized & operational
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Inactive Accounts */}
        <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 dark:text-red-400">
              Inactive Accounts
            </span>
            <div className="text-2xl font-black text-red-950 dark:text-red-200 mt-1">
              {summary.inactive}
            </div>
            <p className="text-[11px] text-red-700 dark:text-red-400/80 mt-0.5">
              Access locked & suspended
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* Employee Capacity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Employee Capacity
            </span>
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {summary.total}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {summary.max_employees ? `${summary.total} / ${summary.max_employees} used` : 'No employee cap configured'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, role, or assigned module..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="ALL" className="dark:bg-slate-800">All Statuses</option>
                <option value="ACTIVE" className="dark:bg-slate-800">Active</option>
                <option value="INACTIVE" className="dark:bg-slate-800">Inactive</option>
              </select>
            </div>

            {/* Role Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="ALL" className="dark:bg-slate-800">All Roles</option>
                <option value="ADMIN" className="dark:bg-slate-800">Admin</option>
                <option value="EMPLOYEE" className="dark:bg-slate-800">Employee</option>
              </select>
            </div>

            {/* Module Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <span className="text-slate-500 font-medium text-[11px]">Module:</span>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer text-xs max-w-[150px] truncate"
              >
                <option value="ALL" className="dark:bg-slate-800">All Modules</option>
                {ALL_MODULES.map((m) => (
                  <option key={m.id} value={m.id} className="dark:bg-slate-800">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredStaff.length}</strong> of{' '}
            {staff.length} employees
          </span>
          {hasActiveFilters && (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Filtered results
            </span>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 pl-4">Employee</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Assigned Work</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 font-medium">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                    <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">No employees found</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria or clear your active filters.</p>
                    {hasActiveFilters && (
                      <button
                        onClick={resetFilters}
                        className="mt-3 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const isAdmin = member.role?.toLowerCase() === 'admin';
                  const isActive = member.status?.toLowerCase() === 'active';
                  const assigned = Array.isArray(member.assigned_modules) ? member.assigned_modules : [];

                  return (
                    <tr
                      key={member.uid || member.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Employee Name & UID */}
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase ${
                              isAdmin
                                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {(member.name || member.email || 'U').charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {isAdmin && (
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" title="Administrator" />
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              ID: {member.id || 'N/A'} • {member.uid?.slice(0, 10) || 'usr_local'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{member.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-3.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-full text-indigo-700 dark:text-indigo-300 font-bold text-[10px]">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                            Employee
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Assigned Work */}
                      <td className="p-3.5 max-w-[280px]">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                            <ShieldCheck className="w-3 h-3" />
                            All Modules (Full Admin Access)
                          </span>
                        ) : assigned.length === 0 ? (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                            No modules assigned (Restricted)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 items-center">
                            {assigned.slice(0, 3).map((modId) => {
                              const mod = MODULE_MAP[modId];
                              return (
                                <span
                                  key={modId}
                                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-medium"
                                  title={mod?.name || modId}
                                >
                                  {mod?.name || modId}
                                </span>
                              );
                            })}
                            {assigned.length > 3 && (
                              <span
                                className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-bold cursor-help"
                                title={assigned
                                  .slice(3)
                                  .map((m) => MODULE_MAP[m]?.name || m)
                                  .join(', ')}
                              >
                                +{assigned.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          <Clock className="w-3 h-3 shrink-0" />
                          <span>{member.last_login || 'Never'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-4 text-right">
                        <button
                          onClick={() => setSelectedEmployee(member)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onEmployeeCreated={handleEmployeeCreated}
        currentCount={staff.length}
        maxEmployees={5}
      />

      {/* Manage Employee Modal */}
      <ManageEmployeeModal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        employee={selectedEmployee}
        onEmployeeUpdated={handleEmployeeUpdated}
        onEmployeeDeleted={handleEmployeeDeleted}
      />
    </div>
  );
}

