import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Eye, EyeOff, CheckCircle, Filter, Activity } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { User, Organization } from '../types';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: 'SIGNER',
    organization: '',
    is_active: true
  });

  const loadData = async () => {
    try {
      const uList = await api.getUsers();
      const oList = await api.getOrganizations();
      setUsers(uList);
      setOrganizations(oList);
      if (oList.length > 0 && !formData.organization) {
        setFormData(prev => ({ ...prev, organization: oList[0].id.toString() }));
      }
    } catch (err) {
      console.error("Failed to load user management data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createUser({
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role,
        organization: formData.organization ? parseInt(formData.organization) : null,
        is_active: formData.is_active
      });

      setSuccessMsg(`User account '${formData.username}' created successfully as ${formData.role}.`);
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        confirm_password: '',
        role: 'SIGNER',
        organization: organizations.length > 0 ? organizations[0].id.toString() : '',
        is_active: true
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      const errDetail = err.response?.data?.details || err.response?.data?.detail || err.message;
      setErrorMsg(typeof errDetail === 'object' ? JSON.stringify(errDetail) : String(errDetail));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      await api.updateUser(user.id, { is_active: !user.is_active });
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update user status.");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.is_active) ||
      (statusFilter === 'INACTIVE' && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 font-mono">
        <div className="relative">
          <Activity className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg animate-pulse" />
        </div>
        <span className="text-xs text-slate-400 tracking-widest uppercase">LOADING ENTERPRISE USER DIRECTORY...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between shadow-md gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin User Account Management</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Centralized provisioning of application accounts and role-based workspace assignments (SIGNER, VERIFIER, SECURITY ANALYST, ADMIN).
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setIsCreateModalOpen(true);
          }}
          className="btn-cyan-gradient px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2 font-bold cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-black" />
          <span>Create New User Account</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input pl-10 pr-3 py-2 text-white font-mono text-xs focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-300">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="glass-input p-2 text-white font-mono text-xs focus:border-cyan-400"
            >
              <option value="ALL" className="bg-slate-900">All Roles</option>
              <option value="ADMIN" className="bg-slate-900">ADMIN</option>
              <option value="SIGNER" className="bg-slate-900">SIGNER</option>
              <option value="VERIFIER" className="bg-slate-900">VERIFIER</option>
              <option value="SECURITY_ANALYST" className="bg-slate-900">SECURITY ANALYST</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input p-2 text-white font-mono text-xs focus:border-cyan-400"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900">ACTIVE</option>
              <option value="INACTIVE" className="bg-slate-900">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel p-6 space-y-4 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">User</th>
                <th className="px-4 py-3">Username & Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.03] transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-cyan-400 font-mono">{u.username}</div>
                    <div className="text-[11px] text-slate-400">{u.email || 'No email registered'}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={u.role} />
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    {u.organization_name || 'Global / All Orgs'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                      u.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/[0.05] text-slate-400 border-white/10'
                    }`}>
                      {u.is_active ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-[11px] font-mono">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                        u.is_active
                          ? 'btn-glass text-slate-300'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-sans">
                    No matching users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>Create New User Account</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white font-bold p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-3 rounded-2xl text-xs font-mono">
                ⚠ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full glass-input p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full glass-input p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full glass-input p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full glass-input p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full glass-input p-2.5 pr-8 text-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full glass-input p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Role & Organization Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Assigned Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full glass-input p-2.5 text-white font-mono"
                  >
                    <option value="SIGNER" className="bg-slate-900">SIGNER (QDS Issuer)</option>
                    <option value="VERIFIER" className="bg-slate-900">VERIFIER (State Check)</option>
                    <option value="SECURITY_ANALYST" className="bg-slate-900">SECURITY ANALYST (Threat SOC)</option>
                    <option value="ADMIN" className="bg-slate-900">ADMIN (Full Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 uppercase text-[10px] tracking-wider">Organization Tenant *</label>
                  <select
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full glass-input p-2.5 text-white font-medium"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id} className="bg-slate-900">
                        {org.name} ({org.domain})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 btn-glass rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 btn-cyan-gradient rounded-xl font-bold"
                >
                  {isSubmitting ? 'Creating Account...' : 'Provision User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
