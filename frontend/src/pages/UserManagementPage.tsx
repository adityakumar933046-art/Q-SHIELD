import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Search, Shield, Eye, EyeOff, CheckCircle, XCircle, Filter, AlertCircle } from 'lucide-react';
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
    return <div className="p-8 text-center text-slate-500 font-mono">Loading Enterprise User Directory...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0B1220] border border-[#1A263D] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md text-white">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-[#00C2FF]" />
            <h1 className="text-xl font-extrabold tracking-wide">Admin User Account Management</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl font-medium">
            Centralized provisioning of application accounts and role-based workspace assignments (SIGNER, VERIFIER, SECURITY ANALYST, ADMIN).
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setIsCreateModalOpen(true);
          }}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User Account</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-[#00C2FF] font-mono"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2 text-slate-900 font-mono"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SIGNER">SIGNER</option>
              <option value="VERIFIER">VERIFIER</option>
              <option value="SECURITY_ANALYST">SECURITY ANALYST</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2 text-slate-900 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B1220] text-white uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">User</th>
                <th className="px-4 py-3">Username & Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-slate-700 font-mono">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-sans">
                    <div className="font-bold text-[#0B1220]">
                      {u.first_name || u.last_name ? `${u.first_name} ${u.last_name}` : u.username}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#00C2FF]">{u.username}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{u.email || 'No email registered'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.role} />
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-slate-800">
                    {u.organization_name || 'Global / All Orgs'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      u.is_active ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30' : 'bg-slate-100 text-slate-500 border border-slate-300'
                    }`}>
                      {u.is_active ? '● ACTIVE' : '○ INACTIVE'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px] font-sans">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 font-sans">
                    <button
                      onClick={() => handleToggleUserStatus(u)}
                      className={`px-3 py-1 rounded text-[11px] font-bold border shadow-sm transition ${
                        u.is_active
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-[#E2E8F0]'
                          : 'bg-[#10B981] hover:bg-[#0E9F6E] text-white border-[#10B981]'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-[#00C2FF]" />
                <span>Create New User Account (Admin Provisioning)</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] p-3 rounded-lg text-xs font-mono">
                ⚠ {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Username *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Temporary Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 pr-8 text-slate-900 font-mono focus:outline-none focus:border-[#00C2FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-[#00C2FF]"
                  />
                </div>
              </div>

              {/* Role & Organization Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Assigned Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-mono"
                  >
                    <option value="SIGNER">SIGNER (QDS Issuer)</option>
                    <option value="VERIFIER">VERIFIER (State Check)</option>
                    <option value="SECURITY_ANALYST">SECURITY ANALYST (Threat SOC)</option>
                    <option value="ADMIN">ADMIN (Full Authority)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 uppercase text-[11px]">Organization Tenant *</label>
                  <select
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-2.5 text-slate-900 font-medium"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.domain})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#E2E8F0] text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0B1220] hover:bg-[#131E33] text-white font-bold rounded-lg shadow-sm"
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
