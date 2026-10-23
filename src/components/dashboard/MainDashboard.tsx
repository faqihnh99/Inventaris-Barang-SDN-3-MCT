import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import {
  Boxes,
  Tv,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Coins,
  FileCheck2,
  Clock,
  ShoppingCart,
  Plus,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

interface MainDashboardProps {
  onNavigate: (view: string) => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigate }) => {
  const { canMutate } = useAuth();
  const { triggerRefresh } = useRealtime();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [triggerRefresh]);

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Hero Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Ringkasan Eksekutif Inventaris Sekolah
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Data Terpusat Realtime</span>
            <span aria-hidden="true">·</span>
            <span>KIB B & KIB E</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Pembaruan: {new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </div>

        {canMutate && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('kibb')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input KIB B</span>
            </button>
            <button
              onClick={() => onNavigate('needs')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Usul Kebutuhan</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Strip 1: Core Inventories & Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Nilai Aset */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Nilai Aset</span>
            <Coins className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatRupiah(stats.totalNilaiAset)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              KIB B: {stats.totalKibB} unit · KIB E: {stats.totalKibE} eks
            </div>
          </div>
        </div>

        {/* Total Barang Fisik */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Inventaris</span>
            <Boxes className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {stats.totalInventory} <span className="text-sm font-normal text-slate-500">Barang</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Tercatat di KIB B dan KIB E
            </div>
          </div>
        </div>

        {/* Total Kebutuhan & Kekurangan */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Kekurangan Barang</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-amber-600 font-mono tabular-nums">
              {stats.totalKekurangan} <span className="text-sm font-normal text-slate-500">Unit/Eks</span>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {stats.totalSangatMendesak} usulan sangat mendesak
            </div>
          </div>
        </div>

        {/* Estimasi Anggaran Dibutuhkan */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Estimasi Anggaran</span>
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              {formatRupiah(stats.totalEstimasiAnggaran)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Pengadaan: {stats.pengadaanBerjalan} aktif · {stats.pengadaanSelesai} selesai
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip 2: Condition & Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Kondisi Baik</span>
            <div className="text-lg font-bold text-emerald-600 font-mono tabular-nums mt-0.5">
              {stats.totalBaik} Unit/Eks
            </div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Rusak Ringan</span>
            <div className="text-lg font-bold text-amber-600 font-mono tabular-nums mt-0.5">
              {stats.totalRusakRingan} Unit/Eks
            </div>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Rusak Berat (Perlu Diganti)</span>
            <div className="text-lg font-bold text-red-600 font-mono tabular-nums mt-0.5">
              {stats.totalRusakBerat} Unit/Eks
            </div>
          </div>
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
      </div>

      {/* Grid: Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Lokasi */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Distribusi Inventaris per Ruangan / Lokasi
            </h3>
            <button
              onClick={() => onNavigate('locations')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <span>Master Lokasi</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.byLocation).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data lokasi</p>
            ) : (
              Object.entries(stats.byLocation)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 7)
                .map(([loc, count]) => {
                  const pct = Math.round((count / (stats.totalInventory || 1)) * 100);
                  return (
                    <div key={loc} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-700">
                        <span className="font-medium">{loc}</span>
                        <span className="font-mono tabular-nums text-slate-500">
                          {count} barang ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Sumber Dana & Tahun Perolehan */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Rekap Sumber Dana Pengadaan
            </h3>
            <button
              onClick={() => onNavigate('all_inventory')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {Object.entries(stats.byFund).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data sumber dana</p>
            ) : (
              Object.entries(stats.byFund).map(([fund, count]) => {
                const pct = Math.round((count / (stats.totalInventory || 1)) * 100);
                return (
                  <div key={fund} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span className="font-medium">{fund}</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {count} unit ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Audit Stream / Recent Activities */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-900">Aktivitas & Perubahan Terbaru Realtime</h3>
          </div>
          <button
            onClick={() => onNavigate('audit_logs')}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
          >
            <span>Seluruh Audit Trail</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {stats.recentLogs.length === 0 ? (
            <p className="py-4 text-slate-400 text-center">Belum ada catatan aktivitas.</p>
          ) : (
            stats.recentLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {log.userRole}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                </div>
                <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
