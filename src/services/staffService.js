import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { ALL_PERMISSION_IDS } from '../config/permissions';

// Fallback initial roster for offline dev mode (strictly the 5 prototype employees)
const FALLBACK_STAFF = [
  {
    uid: 'gRDhAdGw7WSNmYD1gzAkm77uo6X2',
    id: 1,
    name: 'Store Operations Employee',
    email: 'store@invintell.com',
    role: 'employee',
    status: 'active',
    assigned_modules: ['store_monitor', 'customer_analytics', 'spatial_intelligence', 'queue_intelligence', 'alerts'],
    last_login: 'Today at 09:30 AM',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    uid: 'AfS18LpKH0WaKNbast3uppJqsFt2',
    id: 2,
    name: 'Inventory Employee',
    email: 'inventory@invintell.com',
    role: 'employee',
    status: 'active',
    assigned_modules: ['products', 'inventory', 'low_stock', 'forecasting', 'exceptions'],
    last_login: 'Today at 10:15 AM',
    created_at: '2026-08-02T08:00:00Z',
  },
  {
    uid: 'UOZmYBMOQ5REXoYVTzYZppTgtqn2',
    id: 3,
    name: 'Warehouse Employee',
    email: 'warehouse@invintell.com',
    role: 'employee',
    status: 'active',
    assigned_modules: ['orders', 'allocation', 'picking', 'packing', 'dispatch', 'exceptions'],
    last_login: 'Today at 11:20 AM',
    created_at: '2026-08-03T08:00:00Z',
  },
  {
    uid: 'KMAncMUFZhbGEpC53oagpqYrCRw2',
    id: 4,
    name: 'Sales & Billing Employee',
    email: 'sales@invintell.com',
    role: 'employee',
    status: 'active',
    assigned_modules: ['billing_sales', 'products', 'inventory', 'ai_insights', 'alerts'],
    last_login: 'Today at 08:45 AM',
    created_at: '2026-08-04T08:00:00Z',
  },
  {
    uid: '5gWSr2p3ELOU26Cpg3FHPOdZ74g2',
    id: 5,
    name: 'Reports & Finance Employee',
    email: 'finance@invintell.com',
    role: 'employee',
    status: 'active',
    assigned_modules: ['finance', 'report_center', 'ai_insights', 'alerts', 'exceptions'],
    last_login: 'Yesterday at 05:10 PM',
    created_at: '2026-08-05T08:00:00Z',
  },
];

let localRoster = [...FALLBACK_STAFF];

export const staffService = {
  // Fetch real employee roster and live summary KPIs
  getStaff: async () => {
    try {
      const data = await apiGet('/staff');
      if (data && Array.isArray(data.items)) {
        return data;
      }
    } catch {
      // Offline dev fallback
    }

    const total = localRoster.length;
    const active = localRoster.filter((s) => s.status === 'active').length;
    const inactive = total - active;

    return {
      summary: { total, active, inactive, max_employees: null, capacity_text: 'Unlimited' },
      items: [...localRoster],
    };
  },

  // Create new employee account (capped at 5)
  createEmployee: async ({ name, email, password, role = 'employee', status = 'active', assigned_modules = [] }) => {
    try {
      const result = await apiPost('/staff', {
        name,
        email,
        password,
        role,
        status,
        assigned_modules,
      });
      return result;
    } catch (err) {
      if (err?.status !== 0) throw err;
      // Local dev fallback if backend unreachable
      const newStaff = {
        uid: `usr_${Date.now()}`,
        id: localRoster.length + 1,
        name,
        email,
        role,
        status,
        assigned_modules,
        last_login: 'Never',
        created_at: new Date().toISOString(),
      };
      localRoster = [newStaff, ...localRoster];
      return newStaff;
    }
  },

  // Update employee profile details
  updateEmployee: async (uid, data) => {
    try {
      return await apiPatch(`/staff/${uid}`, data);
    } catch (err) {
      if (err?.status !== 0) throw err;
      localRoster = localRoster.map((s) => (s.uid === uid || String(s.id) === String(uid) ? { ...s, ...data } : s));
      return localRoster.find((s) => s.uid === uid || String(s.id) === String(uid));
    }
  },

  // Activate employee account
  activateEmployee: async (uid) => {
    try {
      return await apiPost(`/staff/${uid}/activate`, {});
    } catch (err) {
      if (err?.status !== 0) throw err;
      localRoster = localRoster.map((s) => (s.uid === uid || String(s.id) === String(uid) ? { ...s, status: 'active' } : s));
      return localRoster.find((s) => s.uid === uid || String(s.id) === String(uid));
    }
  },

  // Deactivate employee account
  deactivateEmployee: async (uid) => {
    try {
      return await apiPost(`/staff/${uid}/deactivate`, {});
    } catch (err) {
      if (err?.status !== 0) throw err;
      localRoster = localRoster.map((s) => (s.uid === uid || String(s.id) === String(uid) ? { ...s, status: 'inactive' } : s));
      return localRoster.find((s) => s.uid === uid || String(s.id) === String(uid));
    }
  },

  // Update assigned modules/permissions
  updatePermissions: async (uid, assigned_modules) => {
    try {
      return await apiPatch(`/staff/${uid}/permissions`, { assigned_modules });
    } catch (err) {
      if (err?.status !== 0) throw err;
      localRoster = localRoster.map((s) => (s.uid === uid || String(s.id) === String(uid) ? { ...s, assigned_modules } : s));
      return localRoster.find((s) => s.uid === uid || String(s.id) === String(uid));
    }
  },

  // Send Firebase password reset email
  sendPasswordReset: async (uid) => {
    try {
      return await apiPost(`/staff/${uid}/password-reset`, {});
    } catch (err) {
      if (err?.status !== 0) throw err;
      return { success: true, message: 'Password reset flow initiated.' };
    }
  },

  // Permanently delete an employee account
  deleteEmployee: async (uid) => {
    try {
      const res = await apiDelete(`/staff/${uid}`);
      localRoster = localRoster.filter((s) => s.uid !== uid && String(s.id) !== String(uid));
      return res;
    } catch (err) {
      if (err?.status !== 0) throw err;
      localRoster = localRoster.filter((s) => s.uid !== uid && String(s.id) !== String(uid));
      return { success: true, deleted_uid: uid };
    }
  },

  // Backwards compatibility helpers
  getSummary: async () => {
    const res = await staffService.getStaff();
    return {
      totalStaff: res.summary.total,
      onShift: res.summary.active,
      tasksAssigned: res.items.reduce((acc, s) => acc + (s.assigned_modules?.length || 0), 0),
    };
  },
  getStaffList: async () => {
    const res = await staffService.getStaff();
    return res.items;
  },
};
