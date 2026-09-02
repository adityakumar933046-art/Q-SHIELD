import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Lock, User as UserIcon, ArrowRight, CheckCircle2, 
  AlertCircle, Cpu, Eye, EyeOff, Smartphone, Phone, Siren, 
  Bot, Zap, Sparkles, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

type RoleCategory = 'SUPER_ADMIN' | 'ORGANIZATION_ADMIN' | 'SECURITY_ANALYST' | 'SIGNER' | 'VERIFIER';

interface RoleOption {
  id: RoleCategory;
  name: string;
  badge: string;
  defaultUser: string;
  defaultPass: string;
  icon: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'SUPER_ADMIN',
    name: 'Super Admin',
    badge: 'Master Control',
    defaultUser: 'super_admin',
    defaultPass: 'SuperPassword123!',
    icon: '👑',
    description: 'Full system telemetry & global security policy enforcement',
  },
  {
    id: 'ORGANIZATION_ADMIN',
    name: 'Org Admin',
    badge: 'Enterprise Org',
    defaultUser: 'org_admin',
    defaultPass: 'OrgPassword123!',
    icon: '🏢',
    description: 'Organization identity, member accounts & domain rules',
  },
  {
    id: 'SECURITY_ANALYST',
    name: 'Security Analyst',
    badge: 'Threat Hunter',
    defaultUser: 'test_analyst',
    defaultPass: 'AnalystPassword123!',
    icon: '🔍',
    description: 'Attack simulator, SPRT anomaly matrix & quantum logs',
  },
  {
    id: 'SIGNER',
    name: 'Quantum Signer',
    badge: 'QDS Issuer',
    defaultUser: 'test_signer',
    defaultPass: 'SignerPassword123!',
    icon: '✍️',
    description: 'Teleportation quantum state preparation & QDS issuance',
  },
  {
    id: 'VERIFIER',
    name: 'Quantum Verifier',
    badge: 'Verification Node',
    defaultUser: 'test_verifier',
    defaultPass: 'VerifierPassword123!',
    icon: '🛡️',
    description: 'Bell-state measurement verification & forgery checks',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleCategory>('SUPER_ADMIN');
  const [username, setUsername] = useState('super_admin');
  const [password, setPassword] = useState('SuperPassword123!');
  const [showPassword, setShowPassword] = useState(false);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaChallengeToken, setMfaChallengeToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = (role: RoleOption) => {
    setSelectedRole(role.id);
    setUsername(role.defaultUser);
    setPassword(role.defaultPass);
    setError(null);
    setMfaRequired(false);
  };

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
      setError(
        err.response?.data?.detail || 
        err.response?.data?.non_field_errors?.[0] || 
        'Authentication failed. Please verify your credentials.'
      );
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
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] text-white flex flex-col justify-between relative overflow-x-hidden font-sans selection:bg-[#0070F3] selection:text-white">
      {/* Dynamic Ambient Cyber Circuit Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Radial Dark Vigette & Glowing Core */}
        <div className="absolute inset-0 bg-radial-gradient from-[#0E1628] via-[#090D17] to-[#05070D] opacity-90" />
        
        {/* Top-left Blue Neon Spot */}
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-[#0066FF]/10 rounded-full blur-[160px]" />
        
        {/* Subtle Circuit Grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(0, 150, 255, 0.2) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 80px 80px, 80px 80px'
          }}
        />
      </div>

      {/* TOP FLOATING NAV */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/40 flex items-center justify-center text-[#0080FF] shadow-[0_0_20px_rgba(0,128,255,0.4)] group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-blue-500/20" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-white group-hover:text-[#0080FF] transition-colors">
              Q-SHIELD
            </div>
            <div className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">
              Security Anti-Fraud Center
            </div>
          </div>
        </Link>

        {/* Back to Animated Intro Button */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/40 text-slate-300 hover:text-white transition-all text-xs font-semibold tracking-wider group shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Animated Intro</span>
        </Link>
      </header>

      {/* MAIN CONTENT STAGE: 3D Left Visual + Right Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 md:px-12 py-6">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT 3D CYBER SECURITY PLATFORM (Matches user reference image) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex items-center justify-center relative min-h-[420px] sm:min-h-[540px] select-none">
            
            {/* Outer Concentric Cyber Rings & Circuit Trails */}
            <div className="relative w-[340px] sm:w-[460px] md:w-[500px] h-[340px] sm:h-[460px] md:h-[500px] flex items-center justify-center">
              
              {/* Perspective Ground Ring 1 (Largest) */}
              <div 
                className="absolute inset-0 rounded-full border border-blue-500/20 shadow-[0_0_50px_rgba(0,100,255,0.15)]"
                style={{ transform: 'rotateX(60deg) scale(1.1)' }}
              />

              {/* Perspective Ground Ring 2 (Active Neon Blue Trail) */}
              <div 
                className="absolute inset-6 rounded-full border-2 border-blue-400/40 shadow-[0_0_35px_rgba(0,140,255,0.4),inset_0_0_20px_rgba(0,140,255,0.2)] animate-pulse"
                style={{ transform: 'rotateX(60deg) scale(0.95)' }}
              />

              {/* Perspective Ground Ring 3 (Inner Blue Ring) */}
              <div 
                className="absolute inset-16 rounded-full border border-cyan-400/60 shadow-[0_0_25px_rgba(0,229,255,0.5)]"
                style={{ transform: 'rotateX(60deg) scale(0.8)' }}
              />

              {/* Glowing Circuit Lines radiating outwards */}
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -rotate-45 pointer-events-none" />
              <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rotate-45 pointer-events-none" />

              {/* ================= SATELLITE NODE 1: Top-Left (APP Mobile Node) ================= */}
              <div className="absolute top-[8%] left-[16%] flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
                {/* Node Hologram Base */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111A2E] border-2 border-blue-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(0,128,255,0.6)] relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping opacity-30" />
                  <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 fill-blue-500/20" />
                </div>
                {/* Node Pill Tag */}
                <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                  APP
                </span>
              </div>

              {/* ================= SATELLITE NODE 2: Bottom-Left (Phone / Comms Node) ================= */}
              <div className="absolute bottom-[10%] left-[12%] flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111A2E] border-2 border-blue-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(0,128,255,0.6)] relative">
                  <Phone className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 fill-blue-500/20 -rotate-12" />
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                  COMMS
                </span>
              </div>

              {/* ================= SATELLITE NODE 3: Top-Right (Siren / Alert Beacon Node) ================= */}
              <div className="absolute top-[10%] right-[16%] flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111A2E] border-2 border-blue-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(0,128,255,0.6)] relative">
                  <Siren className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300 fill-cyan-400/20 animate-pulse" />
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-300 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                  ALARM
                </span>
              </div>

              {/* ================= SATELLITE NODE 4: Bottom-Right (Cyber Bot / Shield Sentinel Node) ================= */}
              <div className="absolute bottom-[10%] right-[14%] flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#111A2E] border-2 border-blue-400/60 flex items-center justify-center shadow-[0_0_25px_rgba(0,128,255,0.6)] relative">
                  <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 fill-blue-500/20" />
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-500/30">
                  GUARD
                </span>
              </div>

              {/* ================= CENTRAL 3D PEDESTAL & HOLOGRAPHIC SHIELD ================= */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                {/* Elevated Multi-layer Pedestal Bases */}
                <div className="absolute -bottom-8 w-44 sm:w-56 h-20 bg-gradient-to-b from-[#1C2C4E] to-[#0A1122] rounded-full border-2 border-blue-400/60 shadow-[0_0_60px_rgba(0,128,255,0.7),inset_0_0_30px_rgba(0,180,255,0.4)] flex items-center justify-center">
                  <div className="w-36 sm:w-44 h-14 bg-gradient-to-b from-[#0F1B33] to-[#070D1A] rounded-full border border-cyan-400/70 shadow-[0_0_20px_rgba(0,229,255,0.6)]" />
                </div>

                {/* 3D Glass Holographic Shield (Front & Center) */}
                <div className="relative z-20 flex items-center justify-center animate-bounce duration-[3000ms]">
                  {/* Glowing Aura */}
                  <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-[40px] pointer-events-none" />
                  
                  {/* Crystal Shield Outer Shell */}
                  <div className="relative w-28 h-36 sm:w-36 sm:h-44 bg-gradient-to-b from-blue-400/80 via-blue-600/50 to-blue-900/90 rounded-[2.5rem] border-2 border-cyan-300/80 shadow-[0_0_50px_rgba(0,140,255,0.8),inset_0_0_30px_rgba(255,255,255,0.5)] backdrop-blur-md flex items-center justify-center overflow-hidden">
                    {/* Glass Surface Reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent -skew-y-12" />
                    
                    {/* Inner 3D Lightning Bolt */}
                    <div className="relative z-10 flex items-center justify-center">
                      <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-white fill-white/90 drop-shadow-[0_0_20px_rgba(0,229,255,1)]" />
                    </div>

                    {/* Shield Bottom Edge Highlight */}
                    <div className="absolute bottom-2 inset-x-4 h-1 bg-cyan-300/80 rounded-full blur-[1px]" />
                  </div>

                  {/* Orbiting Photon Particles */}
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-cyan-300 rounded-full shadow-[0_0_12px_#00E5FF] animate-ping" />
                  <div className="absolute bottom-4 -left-3 w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_10px_#0080FF]" />
                </div>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT LOGIN FORM PANEL (Large font, 5 Role Categories, Clean Glass Card) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-[#111726]/90 border border-slate-700/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(0,102,255,0.15)] relative">
              
              {/* Header Title (Big font size as requested) */}
              <div className="text-center sm:text-left mb-6">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  User Login
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
                  Shanhai Security Anti-fraud Center
                </p>
              </div>

              {/* ================= 5 ROLE / CATEGORY SELECTOR ================= */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Login Category ({ROLE_OPTIONS.length} Roles)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleSelectRole(role)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#0066FF]/20 border-[#0066FF] shadow-[0_0_15px_rgba(0,102,255,0.4)] text-white'
                            : 'bg-white/[0.03] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                        }`}
                      >
                        <span className="text-base">{role.icon}</span>
                        <div className="truncate">
                          <div className="text-xs font-bold truncate leading-tight">
                            {role.name}
                          </div>
                          <div className="text-[9px] text-blue-400 font-mono truncate">
                            {role.badge}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* MFA CHALLENGE STEP */}
              {mfaRequired ? (
                <form onSubmit={handleMfaSubmit} className="space-y-5">
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm">
                    <p className="font-bold text-white mb-1">MFA Security Challenge Required</p>
                    <p className="text-xs text-blue-200">
                      Enter the 6-digit authenticator code or backup recovery code to complete sign-in.
                    </p>
                  </div>

                  {!useRecoveryCode ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        6-Digit MFA Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="000000"
                        className="w-full text-center tracking-[0.5em] text-2xl font-mono py-3 px-4 bg-[#141C2E] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#0080FF] focus:ring-2 focus:ring-[#0080FF]/30 transition"
                        autoFocus
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Backup Recovery Code
                      </label>
                      <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="Enter recovery code"
                        className="w-full text-sm font-mono py-3 px-4 bg-[#141C2E] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#0080FF] focus:ring-2 focus:ring-[#0080FF]/30 transition"
                        autoFocus
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-[#0066FF] to-[#0099FF] rounded-xl hover:from-[#0055EE] hover:to-[#0088FF] shadow-[0_0_25px_rgba(0,102,255,0.5)] transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Verifying MFA...' : 'Verify & Enter Workspace'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                      className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      {useRecoveryCode ? 'Use 6-Digit Authenticator Code' : 'Use Backup Recovery Code'}
                    </button>
                  </div>
                </form>
              ) : (
                /* STANDARD CREDENTIALS FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                  
                  {/* Account Number / Username Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Account Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Account Number"
                        className="w-full text-base py-3.5 pl-12 pr-4 bg-[#141C2E] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#0080FF] focus:ring-2 focus:ring-[#0080FF]/40 transition shadow-inner font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-blue-400 hover:text-blue-300 transition"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full text-base py-3.5 pl-12 pr-12 bg-[#141C2E] border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#0080FF] focus:ring-2 focus:ring-[#0080FF]/40 transition shadow-inner font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Big Blue Login Button (Exact Match to Image) */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-4 text-lg font-bold text-white bg-gradient-to-r from-[#0066FF] to-[#0099FF] rounded-xl hover:from-[#0055EE] hover:to-[#0088FF] shadow-[0_0_30px_rgba(0,102,255,0.55)] transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <span>Login</span>
                    )}
                  </button>
                </form>
              )}

              {/* Footer System Status */}
              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
                  <span className="text-emerald-400 font-medium">Node Security Active</span>
                </div>
                <span className="font-mono text-slate-500">Zero-Trust v2.4</span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* FOOTER BAR */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-white/5">
        <p>Q-SHIELD &copy; 2026 Quantum Cyber Threat Defense. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LoginPage;
