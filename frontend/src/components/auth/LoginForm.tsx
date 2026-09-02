import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Shield, Smartphone, Key } from 'lucide-react';
import { FormInput } from './FormInput';
import { PasswordInput } from './PasswordInput';
import { LoadingButton } from './LoadingButton';
import { AuthenticationError } from './AuthenticationError';
import { api } from '../../services/api';
import { User } from '../../types';

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
  onRedirectByRole: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onRedirectByRole }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Field Level Errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaChallengeToken, setMfaChallengeToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    if (!emailOrUsername.trim()) {
      setEmailError('Email or username is required.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError(null);

    try {
      const data = await api.login(emailOrUsername.trim(), password);

      // Check if Step 2 MFA Challenge is required
      if (data.mfa_required) {
        setMfaRequired(true);
        setMfaChallengeToken(data.mfa_challenge);
        setLoading(false);
        return;
      }

      // Successful authentication without MFA
      const user = await api.getCurrentUser();
      onLoginSuccess(user);
      onRedirectByRole(user);
    } catch (err: any) {
      console.error('Login error:', err);
      setLoading(false);

      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail;

        if (status === 401 || status === 400) {
          setGeneralError('Invalid email or password.');
        } else if (status === 403) {
          setGeneralError(detail || 'Your account is currently inactive. Please contact your administrator.');
        } else {
          setGeneralError('Authentication failed. Please check your credentials.');
        }
      } else {
        setGeneralError('Unable to connect to the server. Please try again.');
      }
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setLoading(true);

    try {
      await api.verifyMfaLogin(
        mfaChallengeToken,
        useRecoveryCode ? undefined : mfaCode,
        useRecoveryCode ? recoveryCode : undefined
      );

      const user = await api.getCurrentUser();
      onLoginSuccess(user);
      onRedirectByRole(user);
    } catch (err: any) {
      console.error('MFA verify error:', err);
      setLoading(false);
      setGeneralError(err.response?.data?.detail || 'Invalid MFA verification code.');
    }
  };

  return (
    <div className="w-full max-w-md bg-[#0B1220]/90 border border-[#1F2E4D] rounded-2xl p-8 shadow-2xl backdrop-blur-md font-sans space-y-6">
      {/* Form Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs text-slate-400 font-mono">
          Sign in to access your Q-SHIELD workspace.
        </p>
      </div>

      <AuthenticationError message={generalError} />

      {!mfaRequired ? (
        /* Step 1: Standard Username/Email & Password Login Form */
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <FormInput
            id="emailOrUsername"
            label="Email Address or Username"
            type="text"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              if (emailError) setEmailError(null);
            }}
            placeholder="user@qshield.gov or username"
            required
            error={emailError}
            icon={Mail}
            autoComplete="username"
          />

          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError(null);
            }}
            required
            error={passwordError}
          />

          {/* Remember Me & Forgot Password Links */}
          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#00C2FF] rounded bg-[#131E33] border-[#1F2E4D] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-[#00C2FF] hover:underline font-bold transition"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="pt-2">
            <LoadingButton loading={loading} disabled={!emailOrUsername || !password}>
              Sign In
            </LoadingButton>
          </div>
        </form>
      ) : (
        /* Step 2: Multi-Factor Authentication Challenge Form */
        <form onSubmit={handleMfaSubmit} className="space-y-4 pt-2">
          <div className="p-3 bg-[#131E33] border border-[#1F2E4D] rounded-xl text-center space-y-1">
            <Smartphone className="w-6 h-6 text-[#00C2FF] mx-auto" />
            <h4 className="text-xs font-bold text-white font-mono uppercase">Multi-Factor Authentication Required</h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Enter your 6-digit TOTP authenticator code or single-use recovery code.
            </p>
          </div>

          {!useRecoveryCode ? (
            <FormInput
              id="mfaCode"
              label="6-Digit Authenticator Code"
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="e.g. 123456"
              required
              icon={Smartphone}
            />
          ) : (
            <FormInput
              id="recoveryCode"
              label="Emergency Backup Recovery Code"
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              placeholder="REC-XXXX-XXXX"
              required
              icon={Key}
            />
          )}

          <div className="text-right">
            <button
              type="button"
              onClick={() => setUseRecoveryCode(!useRecoveryCode)}
              className="text-[11px] font-mono text-[#00C2FF] hover:underline"
            >
              {useRecoveryCode ? 'Use 6-digit Authenticator Code' : 'Use Backup Recovery Code'}
            </button>
          </div>

          <div className="pt-2">
            <LoadingButton loading={loading} disabled={useRecoveryCode ? !recoveryCode : !mfaCode}>
              Verify & Access Workspace
            </LoadingButton>
          </div>
        </form>
      )}

      {/* Security Footer Note */}
      <div className="pt-4 border-t border-[#1F2E4D]/60 text-center text-[10px] font-mono text-slate-400">
        <span>Protected by Q-SHIELD Quantum Cryptographic Pipeline</span>
      </div>
    </div>
  );
};
