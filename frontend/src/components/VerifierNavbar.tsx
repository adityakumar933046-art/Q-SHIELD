import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { User, Organization } from '../types';
import { api } from '../services/api';

interface VerifierNavbarProps {
  currentUser: User | null;
}

export const VerifierNavbar: React.FC<VerifierNavbarProps> = ({ currentUser }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const orgList = await api.getOrganizations();
        setOrganizations(orgList);
        
        // Find Quantum Secure Ltd. and select it by default, otherwise select first or current user's org
        const quantumSecure = orgList.find(o => o.name.toLowerCase().includes('quantum secure'));
        if (quantumSecure) {
          setSelectedOrgId(quantumSecure.id.toString());
        } else if (currentUser?.organization) {
          setSelectedOrgId(currentUser.organization.toString());
        } else if (orgList.length > 0) {
          setSelectedOrgId(orgList[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load organizations in navbar:", err);
      }
    };
    fetchOrgs();
  }, [currentUser]);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm select-none">
      {/* Organisation Dropdown */}
      <div className="flex flex-col">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
          Organisation
        </label>
        <div className="relative">
          <select
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 cursor-pointer"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
            {organizations.length === 0 && (
              <option value="">Quantum Secure Ltd.</option>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Right Side: Notification and User Profile */}
      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          {/* Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-green-100 border border-green-200 text-green-700 font-bold flex items-center justify-center overflow-hidden">
            {/* If there's an image we could render it, but a green avatar is shown in screenshot */}
            <div className="w-6 h-6 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-xs font-bold">
              {currentUser?.first_name ? currentUser.first_name[0].toUpperCase() : 'B'}
            </div>
          </div>
          
          <div className="text-left">
            <div className="font-bold text-slate-800 text-xs">
              {currentUser?.first_name && currentUser?.last_name 
                ? `${currentUser.first_name} ${currentUser.last_name}` 
                : currentUser?.username || ''}
            </div>
            <div className="text-[10px] text-slate-400 font-medium capitalize">
              {currentUser?.role ? currentUser.role.toLowerCase() : 'verifier'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
