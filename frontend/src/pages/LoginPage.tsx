import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Key, Lock, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle, Cpu, Eye, EyeOff, Smartphone } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaChallengeToken, setMfaChallengeToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.login(username, password);
      if (data.mfa_required) {
        setMfaRequired(true);
        setMfaChallengeToken(data.mfa_challenge);
        setLoading(false);
        return;
      }

      // Login success without MFA
      const user = await api.getCurrentUser();
      onLoginSuccess(user);
      redirectToDashboard(user);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.response?.data?.non_field_errors?.[0] || 'Authentication failed. Check credentials.');
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.verifyMfaLogin(
        mfaChallengeToken,
        useRecoveryCode ? undefined : mfaCode,
        useRecoveryCode ? recoveryCode : undefined
      );

      const user = await api.getCurrentUser();
      onLoginSuccess(user);
      redirectToDashboard(user);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid MFA verification code.');
      setLoading(false);
    }
  };

  const handleQuickRoleFill = (userRole: string) => {
    setError(null);
    setMfaRequired(false);
    switch (userRole) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        setUsername('super_admin');
        setPassword('SuperPassword123!');
        break;
      case 'ORGANIZATION_ADMIN':
        setUsername('org_admin');
        setPassword('OrgPassword123!');
        break;
      case 'SECURITY_ANALYST':
        setUsername('test_analyst');
        setPassword('AnalystPassword123!');
        break;
      case 'SIGNER':
        setUsername('test_signer');
        setPassword('SignerPassword123!');
        break;
      case 'VERIFIER':
        setUsername('test_verifier');
        setPassword('VerifierPassword123!');
        break;
      default:
        break;
    }
  };

  const redirectToDashboard = (user: User) => {
    const role = user.role.toUpperCase();
    if (role === 'SUPER_ADMIN' || role === 'ORGANIZATION_ADMIN' || role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (role === 'SIGNER') {
      navigate('/signer/dashboard');
    } else if (role === 'VERIFIER') {
      navigate('/verifier/dashboard');
    } else if (role === 'SECURITY_ANALYST') {
      navigate('/analyst/threats');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#070C16] flex flex-col justify-between text-slate-100 font-sans relative overflow-hidden">
      {/* Background Quantum Grid Ambient Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#00C2FF0F_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#10B9810A_0%,transparent_60%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-[#1F2E4D]/60 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#00C2FF]/10 rounded-xl border border-[#00C2FF]/30 text-[#00C2FF]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white">Q-SHIELD</h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              Quantum Cyber Threat Detection Platform
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-slate-300 font-bold">System Online</span>
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline">QDS Protocol v2.4</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Branding & Feature Telemetry (Hidden on small screens) */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block pr-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#00C2FF]/10 border border-[#00C2FF]/30 rounded-full text-xs font-mono text-[#00C2FF]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Quantum Teleportation & QDS Architecture</span>
            </div>

            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Enterprise Role-Based Cyber Threat & Quantum Signature Defense
            </h2>

            <p className="text-sm text-slate-400 leading-relaxed">
              Authenticate into your designated operational workspace. Access real-time quantum execution telemetry, statistical threat alerts (SPRT/Chi-Square), and signature verification engines.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong className="text-white">Strict Multi-Tenant Isolation:</strong> Enforces organization-bounded resource clearance across all 5 operational roles.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong className="text-white">TOTP & Recovery Code Protection:</strong> Enforced pre-authentication MFA challenges for privileged execution.</span>
              </div>
              <div className="flex items-start space-x-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong className="text-white">Single-Use Step-Up Authentication:</strong> Authorizes high-security signature execution tokens for Signer operations.</span>
              </div>
            </div>

            {/* Role Switcher Palette for quick testing */}
            <div className="pt-4 border-t border-[#1F2E4D]/60 space-y-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Quick Role Credentials Selector (Demo Testing)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('SUPER_ADMIN')}
                  className="px-2.5 py-1 bg-[#131E33] hover:bg-[#00C2FF]/20 border border-[#1F2E4D] hover:border-[#00C2FF]/40 rounded-lg text-xs font-mono text-slate-200 transition"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('ORGANIZATION_ADMIN')}
                  className="px-2.5 py-1 bg-[#131E33] hover:bg-[#00C2FF]/20 border border-[#1F2E4D] hover:border-[#00C2FF]/40 rounded-lg text-xs font-mono text-slate-200 transition"
                >
                  Org Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('SECURITY_ANALYST')}
                  className="px-2.5 py-1 bg-[#131E33] hover:bg-[#00C2FF]/20 border border-[#1F2E4D] hover:border-[#00C2FF]/40 rounded-lg text-xs font-mono text-slate-200 transition"
                >
                  Security Analyst
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('SIGNER')}
                  className="px-2.5 py-1 bg-[#131E33] hover:bg-[#00C2FF]/20 border border-[#1F2E4D] hover:border-[#00C2FF]/40 rounded-lg text-xs font-mono text-slate-200 transition"
                >
                  Signer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickRoleFill('VERIFIER')}
                  className="px-2.5 py-1 bg-[#131E33] hover:bg-[#00C2FF]/20 border border-[#1F2E4D] hover:border-[#00C2FF]/40 rounded-lg text-xs font-mono text-slate-200 transition"
                >
                  Verifier
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Card Container */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative">
              <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#00C2FF] to-transparent" />

              {!mfaRequired ? (
                /* Step 1: Standard Username/Email + Password Login */
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-white">Sign In to Q-SHIELD</h3>
                    <p className="text-xs text-slate-400">
                      Enter your account credentials to access your security workspace
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Username or Email
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. super_admin, signer, verifier"
                          className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] transition font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        <Link
                          to="/forgot-password"
                          className="text-[11px] font-mono text-[#00C2FF] hover:underline"
                        >
                          Forgot Password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C2FF] transition font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !username || !password}
                    className="w-full py-3 bg-[#00C2FF] hover:bg-[#00A8DE] text-[#0B1220] font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>

                  {/* Mobile Quick Fill Option */}
                  <div className="block lg:hidden pt-4 border-t border-[#1F2E4D]">
                    <span className="text-[10px] font-mono text-slate-400 block mb-2 text-center uppercase">
                      Quick Demo Autofill
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickRoleFill('SUPER_ADMIN')}
                        className="py-1.5 bg-[#131E33] border border-[#1F2E4D] text-[11px] font-mono text-slate-300 rounded-lg"
                      >
                        Super Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoleFill('SIGNER')}
                        className="py-1.5 bg-[#131E33] border border-[#1F2E4D] text-[11px] font-mono text-slate-300 rounded-lg"
                      >
                        Signer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoleFill('VERIFIER')}
                        className="py-1.5 bg-[#131E33] border border-[#1F2E4D] text-[11px] font-mono text-slate-300 rounded-lg"
                      >
                        Verifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRoleFill('SECURITY_ANALYST')}
                        className="py-1.5 bg-[#131E33] border border-[#1F2E4D] text-[11px] font-mono text-slate-300 rounded-lg"
                      >
                        Analyst
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Step 2: Pre-Auth MFA Verification Form */
                <form onSubmit={handleMfaSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[#00C2FF]">
                      <Smartphone className="w-5 h-5" />
                      <h3 className="text-xl font-extrabold text-white">Multi-Factor Verification</h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      This account requires TOTP authentication to issue operational JWT tokens
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl text-xs text-[#EF4444] flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {!useRecoveryCode ? (
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                        Enter 6-Digit Authenticator Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3 text-center text-2xl font-mono tracking-widest text-[#00C2FF] focus:outline-none focus:border-[#00C2FF]"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Enter Single-Use Recovery Code
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="REC-XXXX-XXXX"
                        className="w-full bg-[#131E33] border border-[#1F2E4D] rounded-xl p-3 text-center text-base font-mono text-[#10B981] focus:outline-none focus:border-[#10B981]"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                      className="text-[#00C2FF] hover:underline"
                    >
                      {useRecoveryCode ? 'Use TOTP Authenticator Code' : 'Use Recovery Code Instead'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMfaRequired(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Back to Login
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || (!useRecoveryCode && mfaCode.length !== 6) || (useRecoveryCode && !recoveryCode)}
                    className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-xl text-xs transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'Verifying MFA...' : 'Complete Authentication'}</span>
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-[#1F2E4D]/60 text-center text-[11px] font-mono text-slate-500 relative z-10">
        Q-SHIELD Security System • Quantum Cyber Threat Detection Protocol • Protected Area
      </footer>
    </div>
  );
};
