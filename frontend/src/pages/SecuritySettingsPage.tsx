import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, Smartphone, Laptop, Trash2, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { api } from '../services/api';
import { User, UserSessionInfo, AuditTrailRecord } from '../types';

interface SecuritySettingsPageProps {
  currentUser: User | null;
}

export const SecuritySettingsPage: React.FC<SecuritySettingsPageProps> = ({ currentUser }) => {
  const [sessions, setSessions] = useState<UserSessionInfo[]>([]);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaQrUri, setMfaQrUri] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recentAudits, setRecentAudits] = useState<AuditTrailRecord[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await api.getSessions();
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchAudits = async () => {
    try {
      const data = await api.getAuditLogs();
      setRecentAudits(data.slice(0, 10));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchAudits();
  }, []);

  const handleRevokeSession = async (jti: string) => {
    try {
      await api.revokeSession(jti);
      setMsg({ text: 'Session revoked successfully.', type: 'success' });
      fetchSessions();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Failed to revoke session.', type: 'error' });
    }
  };

  const handleRevokeAllOthers = async () => {
    try {
      await api.revokeSession(undefined, true);
      setMsg({ text: 'All other active sessions revoked.', type: 'success' });
      fetchSessions();
    } catch (err: any) {
      setMsg({ text: 'Failed to revoke other sessions.', type: 'error' });
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    try {
      const res = await api.generateRecoveryCodes();
      setRecoveryCodes(res.recovery_codes);
      setMsg({ text: 'Single-use recovery codes generated. Store them in a secure location.', type: 'success' });
    } catch (err: any) {
      setMsg({ text: 'Failed to generate recovery codes.', type: 'error' });
    }
  };

  const handleSetupMfa = async () => {
    try {
      const res = await api.setupMfa();
      setMfaSecret(res.mfa_secret);
      setMfaQrUri(res.provisioning_uri);
    } catch (err: any) {
      setMsg({ text: 'Failed to initiate MFA setup.', type: 'error' });
    }
  };

  const handleVerifyMfaSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.verifyMfa(mfaCode);
      setMsg({ text: 'MFA setup completed and verified.', type: 'success' });
      setMfaQrUri(null);
      setMfaCode('');
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Invalid TOTP code.', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (newPassword !== confirmPassword) {
      setMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    try {
      await api.changePassword(oldPassword, newPassword, confirmPassword);
      setMsg({ text: 'Password changed successfully. Other active sessions have been revoked.', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchSessions();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.old_password?.[0] || 'Password change failed.', type: 'error' });
    }
  };

  const isMandatoryMfaRole = currentUser?.requires_mfa;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-[#1F2E4D] pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-[#00C2FF]" />
            <h1 className="text-xl font-bold text-white">Security & Authentication Controls</h1>
          </div>
          <p className="text-xs text-slate-400">
            Device-Aware Session Security, TOTP Multi-Factor Controls & Audit Trail
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-3 bg-[#131E33] border border-[#1F2E4D] px-3.5 py-2 rounded-xl text-xs">
            <span className="text-slate-400">Account Role:</span>
            <span className="font-sans font-bold text-[#00C2FF] uppercase">{currentUser.role}</span>
          </div>
        )}
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
          msg.type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/40 text-[#10B981]' : 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="font-bold underline ml-4 text-[11px]">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Sessions & Device Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sessions Panel */}
          <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Laptop className="w-5 h-5 text-[#00C2FF]" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Device Sessions</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchSessions}
                  disabled={loadingSessions}
                  className="p-1.5 bg-[#131E33] hover:bg-[#1A263D] text-slate-300 rounded-lg border border-[#1F2E4D] transition"
                  title="Refresh Active Sessions"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
                </button>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllOthers}
                    className="px-3 py-1.5 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-bold rounded-lg transition"
                  >
                    Revoke All Other Sessions
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {sessions.map((sess) => (
                <div key={sess.id} className="bg-[#131E33] border border-[#1F2E4D] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-[#0B1220] border border-[#1F2E4D] rounded-xl text-[#00C2FF]">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">
                          {sess.browser || 'Browser'} on {sess.os || 'OS'} ({sess.device_type || 'Desktop'})
                        </span>
                        {sess.is_active && (
                          <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] text-[9px] font-sans font-bold rounded-full border border-[#10B981]/40 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans space-x-3">
                        <span>IP: {sess.ip_address || '127.0.0.1'}</span>
                        <span>•</span>
                        <span>Last active: {new Date(sess.last_active).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(sess.refresh_token_jti)}
                    className="px-3 py-1.5 bg-[#0B1220] hover:bg-[#EF4444]/20 text-slate-400 hover:text-[#EF4444] border border-[#1F2E4D] hover:border-[#EF4444]/40 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-sans">
                  No active session records returned.
                </div>
              )}
            </div>
          </div>

          {/* Audit Event Stream */}
          <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-[#00C2FF]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Authentication Security Events</h2>
            </div>

            <div className="space-y-2 font-sans text-xs">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="bg-[#131E33] border border-[#1F2E4D] p-3 rounded-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[#00C2FF] font-bold">{audit.action_type}</span>
                    <p className="text-[11px] text-slate-400">{audit.user_identifier} • {audit.target_resource}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{new Date(audit.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: MFA & Password Hardening */}
        <div className="space-y-6">
          {/* MFA Policy & Recovery Panel */}
          <div className="bg-[#0B1220] border border-[#1F2E4D] rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-[#00C2FF]">
              <Smartphone className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Factor Authentication</h2>
            </div>

            <div className="bg-[#131E33] border border-[#1F2E4D] p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">TOTP Status:</span>
                <span className={`font-sans font-bold px-2 py-0.5 rounded text-[10px] ${
                  currentUser?.is_mfa_enabled ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40' : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                }`}>
                  {currentUser?.is_mfa_enabled ? 'ENABLED' : 'NOT VERIFIED'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Role Policy:</span>
                <span className="text-[11px] font-sans text-slate-400">
                  {isMandatoryMfaRole ? 'MANDATORY (Enforced)' : 'OPTIONAL'}
                </span>
              </div>
            </div>

            {!currentUser?.is_mfa_enabled && (
              <div className="space-y-3 pt-2">
                {!mfaQrUri ? (
                  <button
                    onClick={handleSetupMfa}
                    className="w-full py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold rounded-xl text-xs transition shadow-md"
                  >
                    Setup TOTP Authenticator
                  </button>
                ) : (
                  <form onSubmit={handleVerifyMfaSetup} className="space-y-3 bg-[#131E33] p-3.5 rounded-xl border border-[#00C2FF]/40">
                    <p className="text-[11px] text-slate-300">
                      Scan in Google Authenticator or manual key: <code className="font-sans text-[#00C2FF]">{mfaSecret}</code>
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      className="w-full bg-[#0B1220] border border-[#1F2E4D] rounded-lg p-2.5 text-center text-lg font-sans text-[#00C2FF]"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-lg transition"
                    >
                      Confirm MFA Setup
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Recovery Codes */}
            <div className="pt-2 border-t border-[#1F2E4D] space-y-3">
              <button
                onClick={handleGenerateRecoveryCodes}
                className="w-full py-2 bg-[#131E33] hover:bg-[#1A263D] text-slate-200 border border-[#1F2E4D] font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <Key className="w-3.5 h-3.5 text-[#00C2FF]" />
                <span>Generate Recovery Codes</span>
              </button>

              {recoveryCodes.length > 0 && (
                <div className="bg-[#0B1220] border border-[#00C2FF]/40 p-3.5 rounded-xl space-y-2">
                  <span className="block text-[10px] font-bold text-[#00C2FF] uppercase tracking-wider">
                    Single-Use Recovery Codes (Save Now)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 font-sans text-xs text-white">
                    {recoveryCodes.map((c, idx) => (
                      <div key={idx} className="bg-[#131E33] p-1.5 rounded text-center border border-[#1F2E4D]">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Panel */}
          <form onSubmit={handleChangePassword} className="bg-[#0B1220] border border-[#1F2E4D] rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 text-[#00C2FF]">
              <Lock className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Password Hardening</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF] font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF] font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#00C2FF] font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!oldPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50"
            >
              Update Password & Revoke Other Sessions
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
