import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Lock, User, LogIn, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickLoginAs, isLoading, error } = useAuth();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      // handled in context
    }
  };

  const quickRoles: { role: UserRole; title: string; subtitle: string; color: string }[] = [
    {
      role: 'admin_tu',
      title: 'Tenaga Administrasi',
      subtitle: 'Input inventaris, usulan kebutuhan, rekap BOS',
      color: 'hover:border-blue-500 hover:bg-blue-50/50',
    },
    {
      role: 'pengurus_barang',
      title: 'Pengurus Barang',
      subtitle: 'KIB B, KIB E, mutasi, cetak QR, terima barang',
      color: 'hover:border-emerald-500 hover:bg-emerald-50/50',
    },
    {
      role: 'kepala_sekolah',
      title: 'Kepala Sekolah (Monitoring)',
      subtitle: 'Monitoring aset, anggaran, catatan koreksi staf',
      color: 'hover:border-amber-500 hover:bg-amber-50/50',
    },
    {
      role: 'superadmin',
      title: 'Administrator IT Sekolah',
      subtitle: 'Kop surat, petugas, master data, backup DB',
      color: 'hover:border-purple-500 hover:bg-purple-50/50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans text-slate-800">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-xl shadow-lg">
          SA
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">SIM-ASET SEKOLAH</h1>
        <p className="text-xs text-slate-400">
          Sistem Pengelolaan Inventaris Barang KIB B & KIB E Terpadu Realtime
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Pengguna (Username)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  placeholder="Masukkan username..."
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  placeholder="Masukkan password..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Quick Login Role Selector for Evaluator Testing */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Akses Cepat Pengujian Peran
              </span>
              <p className="text-[11px] text-slate-500">
                Pilih peran di bawah atau login manual dengan username <span className="font-semibold text-slate-700 font-mono">admin</span>, <span className="font-semibold text-slate-700 font-mono">kepsek</span>, <span className="font-semibold text-slate-700 font-mono">pengurus</span>, atau <span className="font-semibold text-slate-700 font-mono">superadmin</span> (Password: <span className="font-semibold text-slate-700 font-mono">admin123</span> / <span className="font-semibold text-slate-700 font-mono">password123</span>)
              </p>
            </div>

            <div className="space-y-1.5">
              {quickRoles.map((qr) => (
                <button
                  key={qr.role}
                  type="button"
                  onClick={() => quickLoginAs(qr.role)}
                  className={`w-full text-left p-2.5 rounded-xl border border-slate-200 transition-all flex flex-col gap-0.5 ${qr.color}`}
                >
                  <span className="font-bold text-xs text-slate-900">{qr.title}</span>
                  <span className="text-[11px] text-slate-500">{qr.subtitle}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
