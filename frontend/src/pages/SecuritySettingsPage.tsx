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
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Security & Authentication Controls</h1>
          </div>
          <p className="text-xs text-slate-400">
            Device-Aware Session Security, TOTP Multi-Factor Controls & Audit Trail
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center space-x-3 bg-white/[0.04] border border-white/10 px-4 py-2 rounded-2xl text-xs">
            <span className="text-slate-400">Account Role:</span>
            <span className="font-mono font-bold text-cyan-400 uppercase">{currentUser.role}</span>
          </div>
        )}
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between font-mono ${
          msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="font-bold underline ml-4 text-[11px] text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Sessions & Device Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sessions Panel */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Laptop className="w-5 h-5 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Device Sessions</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchSessions}
                  disabled={loadingSessions}
                  className="p-2 btn-glass rounded-xl text-slate-300"
                  title="Refresh Active Sessions"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
                </button>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllOthers}
                    className="px-3.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition"
                  >
                    Revoke Other Sessions
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {sessions.map((sess) => (
                <div key={sess.id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-cyan-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">
                          {sess.browser || 'Browser'} on {sess.os || 'OS'} ({sess.device_type || 'Desktop'})
                        </span>
                        {sess.is_active && (
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[9px] font-mono font-bold rounded-full border border-emerald-500/30 uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono space-x-3">
                        <span>IP: {sess.ip_address || '127.0.0.1'}</span>
                        <span>•</span>
                        <span>Last active: {new Date(sess.last_active).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(sess.refresh_token_jti)}
                    className="px-3 py-1.5 btn-glass hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke</span>
                  </button>
                </div>
              ))}

              {sessions.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  No active session records returned.
                </div>
              )}
            </div>
          </div>

          {/* Audit Event Stream */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Authentication Security Events</h2>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {recentAudits.map((audit) => (
                <div key={audit.id} className="bg-white/[0.03] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-cyan-400 font-bold">{audit.action_type}</span>
                    <p className="text-[11px] text-slate-400 font-sans">{audit.user_identifier} • {audit.target_resource}</p>
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
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Smartphone className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multi-Factor Authentication</h2>
            </div>

            <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">TOTP Status:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  currentUser?.is_mfa_enabled ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {currentUser?.is_mfa_enabled ? 'ENABLED' : 'NOT VERIFIED'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Role Policy:</span>
                <span className="text-[11px] font-mono text-slate-400">
                  {isMandatoryMfaRole ? 'MANDATORY (Enforced)' : 'OPTIONAL'}
                </span>
              </div>
            </div>

            {!currentUser?.is_mfa_enabled && (
              <div className="space-y-3 pt-2">
                {!mfaQrUri ? (
                  <button
                    onClick={handleSetupMfa}
                    className="w-full py-2.5 btn-cyan-gradient rounded-2xl text-xs font-bold"
                  >
                    Setup TOTP Authenticator
                  </button>
                ) : (
                  <form onSubmit={handleVerifyMfaSetup} className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-cyan-500/30">
                    <p className="text-[11px] text-slate-300">
                      Scan in Authenticator or manual key: <code className="font-mono text-cyan-400">{mfaSecret}</code>
                    </p>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      className="w-full glass-input p-2.5 text-center text-lg font-mono text-cyan-400 focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 btn-cyan-gradient text-xs font-bold rounded-xl"
                    >
                      Confirm MFA Setup
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Recovery Codes */}
            <div className="pt-2 border-t border-white/10 space-y-3">
              <button
                onClick={handleGenerateRecoveryCodes}
                className="w-full py-2 btn-glass font-bold rounded-2xl text-xs flex items-center justify-center space-x-2"
              >
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                <span>Generate Recovery Codes</span>
              </button>

              {recoveryCodes.length > 0 && (
                <div className="bg-white/[0.03] border border-cyan-500/30 p-4 rounded-2xl space-y-2">
                  <span className="block text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Single-Use Recovery Codes (Save Now)
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 font-mono text-xs text-white">
                    {recoveryCodes.map((c, idx) => (
                      <div key={idx} className="bg-white/[0.04] p-1.5 rounded-xl text-center border border-white/10">
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Panel */}
          <form onSubmit={handleChangePassword} className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400">
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
                  className="w-full glass-input p-2.5 text-white font-mono focus:border-cyan-400"
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
                  className="w-full glass-input p-2.5 text-white font-mono focus:border-cyan-400"
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
                  className="w-full glass-input p-2.5 text-white font-mono focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!oldPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 btn-cyan-gradient rounded-2xl text-xs font-bold disabled:opacity-50"
            >
              Update Password & Revoke Sessions
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
