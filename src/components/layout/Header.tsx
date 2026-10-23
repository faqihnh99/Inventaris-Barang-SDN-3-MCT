import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { UserRole } from '../../types';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronDown,
  Layers,
  Shield,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';

interface HeaderProps {
  currentViewTitle: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentViewTitle, onNavigate }) => {
  const { user, logout, quickLoginAs } = useAuth();
  const { isConnected } = useRealtime();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string; desc: string }> = {
    admin_tu: {
      label: 'Tenaga Administrasi',
      badge: 'Gawai A: Input & Kebutuhan',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      desc: 'Input inventaris, usulkan kebutuhan, cek kekurangan',
    },
    pengurus_barang: {
      label: 'Pengurus Barang',
      badge: 'Gawai B: KIB, Lokasi, QR',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      desc: 'Kelola KIB B & E, perpindahan fisik, cetak QR, penerimaan',
    },
    kepala_sekolah: {
      label: 'Kepala Sekolah',
      badge: 'Gawai C: Mode Monitoring',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Monitoring read-only, tinjau nilai aset & kirim koreksi',
    },
    superadmin: {
      label: 'Administrator Sistem',
      badge: 'Akses Penuh',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      desc: 'Kop surat, identitas petugas, backup, user, master data',
    },
  };

  const currentRoleInfo = user ? roleLabels[user.role] : null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
      {/* Zone 1: Brand & View Context */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-wider">
            SA
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            SIM-ASET
          </span>
        </div>
        <span className="text-slate-300">/</span>
        <h1 className="text-sm font-semibold text-slate-700 truncate">
          {currentViewTitle}
        </h1>
      </div>

      {/* Zone 2: Realtime Connection & Quick Device Switcher */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Realtime Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
          {isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Realtime Terhubung</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Menyambungkan Realtime...</span>
            </>
          )}
        </div>

        {/* Multi-Device Role Switcher (Crucial for testing Gawai A, Gawai B, Gawai C) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Ganti Peran / Simulasi Multi-Perangkat"
          >
            <Smartphone className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden md:inline">Simulasi Gawai:</span>
            <span className="font-semibold text-slate-900">
              {currentRoleInfo?.label || 'Pilih Peran'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Uji Coba Multi-Perangkat & Peran</p>
                <p className="text-[11px] text-slate-500">
                  Pindah akun secara instan untuk menguji hak akses & sinkronisasi realtime
                </p>
              </div>

              <div className="p-1.5 space-y-1">
                {(Object.keys(roleLabels) as UserRole[]).map((r) => {
                  const info = roleLabels[r];
                  const isCurrent = user?.role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        quickLoginAs(r);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                        isCurrent
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{info.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {info.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{info.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
              {user?.name}
            </p>
            <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
              {user?.jabatan || user?.role}
            </p>
          </div>

          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
