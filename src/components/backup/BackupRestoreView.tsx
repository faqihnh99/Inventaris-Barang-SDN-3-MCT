import React, { useState, useEffect } from 'react';
import { BackupRecord } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Clock,
  HardDrive,
  FileCheck,
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const { isSuperadmin } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notes, setNotes] = useState('');
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [restoring, setRestoring] = useState(false);

  const loadBackups = async () => {
    try {
      const data = await api.getBackups();
      setBackups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, [triggerRefresh]);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await api.createBackup(notes || 'Snapshot backup manual sistem');
      setNotes('');
      loadBackups();
      alert('Snapshot backup database berhasil dibuat.');
    } catch (err: any) {
      alert('Gagal membuat backup: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadFullExport = () => {
    window.location.href = `/api/backup/export-full?token=${localStorage.getItem('simaset_token') || ''}`;
  };

  const handleExecuteRestore = async () => {
    if (!restoreFile) {
      alert('Pilih file backup (.json) terlebih dahulu.');
      return;
    }
    if (restoreConfirmText !== 'PULIHKAN') {
      alert('Ketik kata "PULIHKAN" persis untuk mengonfirmasi proses pemulihan database.');
      return;
    }

    setRestoring(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        await api.restoreBackup(json);
        alert('Database berhasil dipulihkan dari file backup! Sistem akan memuat ulang data terbaru.');
        setRestoreFile(null);
        setRestoreConfirmText('');
        loadBackups();
      } catch (err: any) {
        alert('Gagal memulihkan database: ' + err.message);
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(restoreFile);
  };

  const handleResetDemoData = async () => {
    if (window.confirm('PERINGATAN: Seluruh transaksi yang ada akan dikembalikan ke data awal standar sekolah. Lanjutkan reset demo?')) {
      try {
        await api.resetDemoData();
        alert('Data demo standar sekolah berhasil dimuat kembali.');
        loadBackups();
      } catch (err: any) {
        alert('Gagal reset: ' + err.message);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Backup & Pemulihan Database Terpusat
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Amankan seluruh data KIB B, KIB E, mutasi, kebutuhan, dan identitas dinas dalam format snapshot JSON terpusat
          </p>
        </div>

        <button
          onClick={handleDownloadFullExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Database Lengkap (.json)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Snapshot Backup */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <HardDrive className="w-4 h-4 text-indigo-600" />
            <span>Buat Snapshot Cadangan Baru</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Menyimpan seluruh kondisi terkini database ke dalam berkas cadangan lokal server dengan penanda waktu otomatis.
          </p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Catatan Backup (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Sebelum tutup buku semester 1 2026..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={creating || !isSuperadmin}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {creating ? 'Membuat Snapshot Cadangan...' : 'Buat Snapshot Sekarang'}
          </button>
        </div>

        {/* Restore Backup with Confirmation */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Pulihkan Database dari File (.json)</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Pilih berkas JSON cadangan valid untuk memulihkan seluruh struktur dan data inventaris sekolah.
          </p>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Pilih Berkas Backup (.json)</label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Ketik <span className="font-mono text-red-600 font-bold">PULIHKAN</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              placeholder="PULIHKAN"
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            onClick={handleExecuteRestore}
            disabled={restoring || !restoreFile || restoreConfirmText !== 'PULIHKAN' || !isSuperadmin}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-40"
          >
            {restoring ? 'Memulihkan Database...' : 'Konfirmasi Pulihkan Database'}
          </button>
        </div>
      </div>

      {/* Snapshot History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Riwayat Berkas Snapshot Cadangan di Server</span>
          </h3>

          <button
            onClick={handleResetDemoData}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
            title="Reset ke data awal standar sekolah"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Ulang Data Standar Sekolah</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-3 py-2.5">Nama Berkas Cadangan</th>
                <th className="px-3 py-2.5">Waktu Pencadangan</th>
                <th className="px-3 py-2.5">Dibuat Oleh</th>
                <th className="px-3 py-2.5 text-right">Jumlah Aset</th>
                <th className="px-3 py-2.5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                    Belum ada snapshot backup lokal tersimpan.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-bold text-slate-900">{b.filename}</td>
                    <td className="px-3 py-2 text-slate-600">{formatDateTime(b.backupDate)}</td>
                    <td className="px-3 py-2 text-slate-700 font-sans">{b.createdBy}</td>
                    <td className="px-3 py-2 text-right text-indigo-700 font-bold tabular-nums">
                      {b.itemCount}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-sans">{b.notes}</td>
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
