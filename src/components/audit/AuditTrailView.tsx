import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { api } from '../../api';
import { useRealtime } from '../../context/RealtimeContext';
import { formatDateTime } from '../../utils/formatters';
import { History, Search, Filter, ShieldCheck } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const { triggerRefresh } = useRealtime();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActivityLogs()
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [triggerRefresh]);

  const filteredLogs = logs.filter((log) => {
    if (moduleFilter && log.module !== moduleFilter) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        log.userName.toLowerCase().includes(term) ||
        log.details.toLowerCase().includes(term) ||
        (log.targetTitle && log.targetTitle.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Audit Trail & Catatan Riwayat Aktivitas Realtime
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Merekam seluruh jejak transaksi, penambahan, pengubahan, mutasi lokasi, login, dan modifikasi data secara permanen
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama pengguna, objek, atau uraian transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Modul Sistem</option>
            <option value="KIB_B">KIB B (Peralatan & Mesin)</option>
            <option value="KIB_E">KIB E (Buku)</option>
            <option value="LOKASI">Lokasi & Mutasi</option>
            <option value="KEBUTUHAN">Kebutuhan Barang</option>
            <option value="PENGADAAN">Pengadaan Barang</option>
            <option value="PETUGAS">Pengaturan Petugas</option>
            <option value="KOP_SURAT">Kop Surat</option>
            <option value="AUTH">Login & Autentikasi</option>
            <option value="DATABASE">Database & Backup</option>
          </select>
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua Jenis Aksi</option>
            <option value="CREATE">Tambah Data Baru (CREATE)</option>
            <option value="UPDATE">Ubah Data (UPDATE)</option>
            <option value="DELETE">Hapus Data (DELETE)</option>
            <option value="TRANSFER">Mutasi Lokasi (TRANSFER)</option>
            <option value="PROCUREMENT_RECEIVE">Penerimaan Pengadaan</option>
            <option value="LOGIN">Sesi Login (LOGIN)</option>
            <option value="SETTINGS_UPDATE">Pembaruan Pengaturan</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-3 w-10 text-center">No</th>
                <th className="px-3 py-3">Waktu Transaksi</th>
                <th className="px-4 py-3">Pengguna & Peran</th>
                <th className="px-3 py-3">Aksi</th>
                <th className="px-3 py-3">Modul</th>
                <th className="px-5 py-3">Rincian Transaksi / Perubahan Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat log aktivitas...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada aktivitas yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-2.5 text-center font-mono text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-2.5 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500">{log.userRole}</div>
                    </td>

                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-50 text-blue-700'
                            : log.action === 'DELETE'
                            ? 'bg-red-50 text-red-700'
                            : log.action === 'TRANSFER'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      {log.module}
                    </td>

                    <td className="px-5 py-2.5 text-slate-800 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
