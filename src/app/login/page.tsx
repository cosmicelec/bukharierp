'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authenticateUser } from '@/lib/auth-client';
import {
  Package,
  Shield,
  User,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await authenticateUser(username, password, role);

      if (res.success) {
        // Redirect to main dashboard
        router.push('/');
        router.refresh();
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login attempt failed');
    } finally {
      setLoading(false);
    }
  };

  const setPresetCredentials = (targetRole: 'Admin' | 'Staff') => {
    setRole(targetRole);
    if (targetRole === 'Admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('staff');
      setPassword('staff123');
    }
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 select-none">
      {/* Centered Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col">
        {/* Brand Header */}
        <div className="bg-slate-900 px-8 pt-8 pb-6 text-white text-center relative border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-3">
            <Package className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase text-white">
            Bukhari Stationery ERP
          </h1>
          <p className="text-xs text-blue-300 font-medium mt-0.5">
            Government Tenders & Spatial Inventory Management System
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-emerald-400">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>SQLCipher AES-256 Vault Active</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          {/* Role Toggle Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Access Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPresetCredentials('Admin')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'Admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin (Owner)</span>
              </button>

              <button
                type="button"
                onClick={() => setPresetCredentials('Staff')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  role === 'Staff'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Staff (Counter)</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Vault Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Unlocking Vault...</span>
              ) : (
                <>
                  <span>Unlock System & Login</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Role Access Information Helper */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-xl">
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              Default Operator Credentials:
            </p>
            <div className="flex justify-between font-mono text-[11px] text-slate-600">
              <span>Admin: <strong className="text-slate-900">admin</strong> / admin123</span>
              <span>Staff: <strong className="text-slate-900">staff</strong> / staff123</span>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Bukhari Stationery ERP v1.0 &bull; Offline-First Desktop Build
          </p>
        </div>
      </div>
    </div>
  );
}
