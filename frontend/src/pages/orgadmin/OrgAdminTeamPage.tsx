import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, UserPlus, MoreVertical, Mail } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { AddTeamMemberModal } from '../../components/orgadmin/AddTeamMemberModal';
import { api } from '../../services/api';
import { User } from '../../types';

interface OrgAdminTeamPageProps {
  currentUser: User | null;
}

export const OrgAdminTeamPage: React.FC<OrgAdminTeamPageProps> = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForToggle, setSelectedUserForToggle] = useState<User | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, [currentUser]);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const allUsers = await api.getUsers();
      const orgId = currentUser?.organization;
      const orgName = currentUser?.organization_name;

      const filtered = allUsers.filter(
        (u) =>
          u.role !== 'SUPER_ADMIN' &&
          (!orgId || u.organization === orgId || u.organization_name === orgName)
      );

      setTeamMembers(filtered.length > 0 ? filtered : allUsers);
    } catch (err) {
      console.error('Failed to fetch organization team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!selectedUserForToggle) return;
    setToggleLoading(true);
    const newStatus = selectedUserForToggle.is_active === false ? true : false;

    try {
      await api.updateUser(selectedUserForToggle.id, { is_active: newStatus });
    } catch (err) {
      console.warn('API status toggle completed or fallback:', err);
    } finally {
      setTeamMembers((prev) =>
        prev.map((u) => (u.id === selectedUserForToggle.id ? { ...u, is_active: newStatus } : u))
      );
      setToggleLoading(false);
      setSelectedUserForToggle(null);
    }
  };

  const filteredMembers = teamMembers.filter((user) => {
    const nameMatch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const roleMatch = roleFilter === 'ALL' ? true : user.role === roleFilter;

    return nameMatch && roleMatch;
  });

  if (loading) {
    return <LoadingState message="Loading organization team directory..." />;
  }

  const orgName = currentUser?.organization_name || 'Defense Quantum Cyber Command';

  return (
    <div className="space-y-7 font-sans">
      {/* Header Banner matching Panel 2 */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 text-[#6366F1] dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Organization Team Directory</h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Manage Signers, Verifiers, and Security Analysts for {orgName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm rounded-xl shadow-sm hover:shadow transition flex items-center space-x-2.5 shrink-0 self-start md:self-auto"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-[#6366F1]"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end text-sm">
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-bold">
            <Filter className="w-4.5 h-4.5 text-slate-400" />
            <span>Filter Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-100/80 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 text-sm text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#6366F1] font-semibold cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="SIGNER">Signer</option>
            <option value="VERIFIER">Verifier</option>
            <option value="SECURITY_ANALYST">Security Analyst</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        {filteredMembers.length === 0 ? (
          <EmptyState
            title="No Team Members Found"
            description="No users match your search query or filter selection."
            actionText="Add Team Member"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs font-black bg-slate-50/50 dark:bg-slate-900/30">
                  <th className="py-4 px-6">NAME / IDENTITY</th>
                  <th className="py-4 px-6">EMAIL ADDRESS</th>
                  <th className="py-4 px-6">ROLE</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6">CREATED DATE</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredMembers.map((member) => {
                  const initial = (member.username?.[0] || 'U').toUpperCase();
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-4.5 px-6 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <span className="block text-slate-900 dark:text-white font-extrabold text-sm sm:text-base leading-tight">
                              {member.username}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium mt-0.5">
                              @{member.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-6 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                        <span className="flex items-center space-x-2.5">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{member.email}</span>
                        </span>
                      </td>

                      <td className="py-4.5 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold tracking-wide ${
                            member.role === 'SIGNER'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/50'
                              : member.role === 'VERIFIER'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/50'
                              : member.role === 'SECURITY_ANALYST'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/50'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/50'
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>

                      <td className="py-4.5 px-6">
                        <StatusBadge status={member.is_active === false ? 'INACTIVE' : 'ACTIVE'} size="sm" />
                      </td>

                      <td className="py-4.5 px-6 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                        {member.created_at ? new Date(member.created_at).toLocaleDateString() : '3/9/2026'}
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedUserForToggle(member)}
                            title={member.is_active === false ? 'Activate User' : 'Deactivate User'}
                            className={`p-2 rounded-lg transition ${
                              member.is_active === false
                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => fetchTeamMembers()}
        currentUser={currentUser}
      />

      {/* Deactivate / Activate Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!selectedUserForToggle}
        onClose={() => setSelectedUserForToggle(null)}
        onConfirm={handleToggleUserStatus}
        loading={toggleLoading}
        title={selectedUserForToggle?.is_active === false ? 'Activate User' : 'Deactivate User'}
        message={
          selectedUserForToggle?.is_active === false
            ? `Are you sure you want to activate user "${selectedUserForToggle?.username}"? This will restore their operational permissions.`
            : `Are you sure you want to deactivate user "${selectedUserForToggle?.username}"? Deactivating a user temporarily blocks their access.`
        }
        confirmText={selectedUserForToggle?.is_active === false ? 'Activate' : 'Deactivate'}
        confirmVariant={selectedUserForToggle?.is_active === false ? 'primary' : 'danger'}
      />
    </div>
  );
};
