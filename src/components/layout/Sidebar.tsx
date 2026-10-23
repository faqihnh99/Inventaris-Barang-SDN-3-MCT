import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Eye,
  Tv,
  BookOpen,
  Boxes,
  FileCheck2,
  ShoppingCart,
  MessageSquareDiff,
  MapPin,
  ArrowRightLeft,
  QrCode,
  ScanLine,
  FileSpreadsheet,
  School,
  FileText,
  Users,
  UserCog,
  Database,
  History,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { user, isKepalaSekolah, isSuperadmin, isPengurusBarang } = useAuth();

  const navSections = [
    {
      title: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Ringkasan Utama', icon: LayoutDashboard },
        { id: 'monitoring', label: 'Monitoring Kepala Sekolah', icon: Eye, badge: 'Monitoring' },
      ],
    },
    {
      title: 'INVENTARIS SEKOLAH',
      items: [
        { id: 'kibb', label: 'KIB B - Peralatan & Mesin', icon: Tv },
        { id: 'kibe', label: 'KIB E - Buku', icon: BookOpen },
        { id: 'all_inventory', label: 'Semua Inventaris', icon: Boxes },
      ],
    },
    {
      title: 'KEBUTUHAN & PENGADAAN',
      items: [
        { id: 'needs', label: 'Kebutuhan Barang', icon: FileCheck2 },
        { id: 'procurement', label: 'Pengadaan Barang', icon: ShoppingCart },
        { id: 'correction_notes', label: 'Catatan Koreksi Kepsek', icon: MessageSquareDiff },
      ],
    },
    {
      title: 'LOKASI & FISIK',
      items: [
        { id: 'locations', label: 'Master Lokasi Ruangan', icon: MapPin },
        { id: 'transfers', label: 'Riwayat Perpindahan', icon: ArrowRightLeft },
        { id: 'label_print', label: 'Cetak Label & QR Code', icon: QrCode },
        { id: 'qr_scan', label: 'Pindai QR Code', icon: ScanLine },
      ],
    },
    {
      title: 'LAPORAN ADMINISTRASI',
      items: [
        { id: 'reports', label: '22 Rekap Laporan & Ekspor', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'PENGATURAN & SISTEM',
      items: [
        { id: 'settings_school', label: 'Profil & Identitas Sekolah', icon: School },
        { id: 'settings_letterhead', label: 'Pengaturan Kop Surat', icon: FileText },
        { id: 'settings_staff', label: 'Pejabat & Pengurus Barang', icon: UserCog },
        ...(isSuperadmin
          ? [
              { id: 'users_mgmt', label: 'Manajemen Pengguna', icon: Users },
              { id: 'backup_restore', label: 'Backup & Restore DB', icon: Database },
            ]
          : []),
        { id: 'audit_logs', label: 'Audit Trail & Aktivitas', icon: History },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
          SA
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">SIM-ASET SEKOLAH</h2>
          <p className="text-[11px] text-slate-400">KIB B & E Terpadu Realtime</p>
        </div>
      </div>

      {/* Role Notice if Kepala Sekolah */}
      {isKepalaSekolah && (
        <div className="mx-3 mt-3 p-2.5 bg-amber-950/60 border border-amber-700/50 rounded-lg text-amber-300 text-xs flex items-center gap-2">
          <Eye className="w-4 h-4 shrink-0" />
          <span className="leading-tight">
            Mode Monitoring Aktif: Hanya melihat & memberi catatan koreksi.
          </span>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
        <span>SIM-ASET v2.0 · Database Pusat</span>
      </div>
    </aside>
  );
};
