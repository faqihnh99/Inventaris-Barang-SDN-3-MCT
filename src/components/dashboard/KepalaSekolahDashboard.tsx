import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { DashboardStats, InventoryItem, NeedItem, CorrectionNote } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatRupiah, formatDate, formatDateTime } from '../../utils/formatters';
import {
  Eye,
  ShieldAlert,
  Coins,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  MessageSquareDiff,
  Send,
  FileSpreadsheet,
  Clock,
  UserCheck,
} from 'lucide-react';

interface KepalaSekolahDashboardProps {
  onNavigate: (view: string) => void;
}

export const KepalaSekolahDashboard: React.FC<KepalaSekolahDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { triggerRefresh } = useRealtime();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [notes, setNotes] = useState<CorrectionNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // New Note Modal state
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [noteModule, setNoteModule] = useState<'KIB_B' | 'KIB_E' | 'KEBUTUHAN' | 'PENGADAAN' | 'UMUM'>('KEBUTUHAN');
  const [noteItemTitle, setNoteItemTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteUrgency, setNoteUrgency] = useState<'Biasa' | 'Penting' | 'Segera Tindaklanjuti'>('Penting');
  const [submittingNote, setSubmittingNote] = useState(false);

  const loadData = async () => {
    try {
      const [s, itms, nds, nts] = await Promise.all([
        api.getDashboardStats(),
        api.getInventoryItems(),
        api.getNeeds(),
        api.getCorrectionNotes(),
      ]);
      setStats(s);
      setItems(itms);
      setNeeds(nds);
      setNotes(nts);
    } catch (err) {
      console.error('Error loading monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  const handleSendCorrectionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setSubmittingNote(true);
    try {
      await api.createCorrectionNote({
        targetModule: noteModule,
        targetItemTitle: noteItemTitle.trim() || undefined,
        noteText: noteText.trim(),
        urgency: noteUrgency,
      });
      setShowNoteModal(false);
      setNoteText('');
      setNoteItemTitle('');
      loadData();
    } catch (err: any) {
      alert('Gagal mengirim catatan: ' + err.message);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading || !stats) {
    return <div className="p-8 text-center text-slate-500">Memuat dashboard monitoring Kepala Sekolah...</div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Context Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0 mt-0.5">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-900">
              Dashboard Monitoring Kepala Sekolah (Mode Read-Only)
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
              Anda memiliki hak akses penuh untuk memantau data KIB B, KIB E, kekurangan barang, anggaran, dan laporan resmi tanpa mengubah data sumber. Untuk perbaikan, gunakan fitur Catatan/Koreksi Data di bawah.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowNoteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <MessageSquareDiff className="w-4 h-4" />
          <span>Beri Catatan / Koreksi Data</span>
        </button>
      </div>

      {/* Primary Monitoring Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Nilai Total Aset Sekolah</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatRupiah(stats.totalNilaiAset)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            KIB B: {stats.totalKibB} unit · KIB E: {stats.totalKibE} buku
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Estimasi Kebutuhan Anggaran</span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {formatRupiah(stats.totalEstimasiAnggaran)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kekurangan fisik: {stats.totalKekurangan} unit/eks
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Barang Rusak (Ringan / Berat)</span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {stats.totalRusakRingan + stats.totalRusakBerat} <span className="text-xs font-normal text-slate-500">Barang</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.totalRusakBerat} rusak berat (butuh penggantian)
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Catatan Koreksi Saya</span>
          <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums mt-1">
            {notes.length} <span className="text-xs font-normal text-slate-500">Tercatat</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {notes.filter((n) => n.status !== 'Selesai Diluruskan').length} menunggu tanggapan staf
          </p>
        </div>
      </div>

      {/* Grid: Unfulfilled Needs & Shortages Review */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Analisis Kekurangan Barang & Anggaran Pengadaan
            </h3>
            <p className="text-xs text-slate-500">
              Perhitungan otomatis: Kekurangan = Max(0, Dibutuhkan - Tersedia di Sekolah)
            </p>
          </div>
          <button
            onClick={() => onNavigate('needs')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Lihat Detail Kebutuhan →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Nama Barang / Buku</th>
                  <th className="px-3 py-3">KIB</th>
                  <th className="px-3 py-3 text-right">Dibutuhkan</th>
                  <th className="px-3 py-3 text-right">Tersedia</th>
                  <th className="px-3 py-3 text-right">Kekurangan</th>
                  <th className="px-3 py-3 text-right">Estimasi Anggaran</th>
                  <th className="px-3 py-3">Prioritas</th>
                  <th className="px-3 py-3">Lokasi</th>
                  <th className="px-3 py-3">Status Pengadaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {needs.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{n.name}</td>
                    <td className="px-3 py-3 text-slate-600">{n.kib === 'KIB_B' ? 'Peralatan (B)' : 'Buku (E)'}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">{n.quantityNeeded} {n.unit}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-emerald-600 font-medium">{n.quantityAvailable}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums text-amber-600 font-bold">{n.quantityShortage}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatRupiah(n.estimatedTotalBudget)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[11px] font-semibold ${
                        n.priority === 'Sangat Mendesak' ? 'text-red-700' :
                        n.priority === 'Mendesak' ? 'text-amber-700' : 'text-slate-600'
                      }`}>
                        {n.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{n.locationName}</td>
                    <td className="px-3 py-3">
                      <span className="text-[11px] text-slate-700 font-medium">{n.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Inventory Entries & Who Inputted Them (Accountability) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inventaris Terbaru & Akuntabilitas Petugas Input
            </h3>
            <p className="text-xs text-slate-500">
              Memantau petugas yang melakukan input serta waktu pembaruan terakhir
            </p>
          </div>
          <button
            onClick={() => onNavigate('all_inventory')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Lihat Semua Inventaris →
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Kode Barang</th>
                  <th className="px-3 py-3">Nama / Judul</th>
                  <th className="px-3 py-3">Lokasi</th>
                  <th className="px-3 py-3">Kondisi</th>
                  <th className="px-3 py-3 text-right">Jumlah & Nilai</th>
                  <th className="px-3 py-3">Petugas Penginput</th>
                  <th className="px-3 py-3">Pembaruan Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.slice(0, 6).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{item.itemCode}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900">
                      {item.name}
                      {item.brandModel && <span className="block text-[11px] font-normal text-slate-500">{item.brandModel}</span>}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{item.locationName}</td>
                    <td className="px-3 py-3">
                      <span className={`font-medium ${
                        item.condition === 'Baik' ? 'text-emerald-700' :
                        item.condition === 'Rusak Ringan' ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">
                      <div>{item.quantity} {item.unit}</div>
                      <div className="text-[11px] text-slate-500">{formatRupiah(item.totalValue)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-900">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{item.createdBy || 'Petugas Administrasi'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                      {formatDateTime(item.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Catatan / Koreksi Data Sent to Staff */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Catatan & Koreksi Data Kepala Sekolah
            </h3>
            <p className="text-xs text-slate-500">
              Instruksi dan catatan evaluasi yang dikirimkan kepada Pengurus Barang dan Tenaga Administrasi
            </p>
          </div>
          <button
            onClick={() => setShowNoteModal(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            + Buat Catatan Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-slate-400 text-xs md:col-span-2">
              Belum ada catatan koreksi yang dikirimkan.
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{note.targetModule}</span>
                    {note.targetItemTitle && (
                      <span className="text-xs text-slate-600">· {note.targetItemTitle}</span>
                    )}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    note.urgency === 'Segera Tindaklanjuti' ? 'bg-red-50 text-red-700' :
                    note.urgency === 'Penting' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {note.urgency}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{note.noteText}"
                </p>

                {note.responseNote && (
                  <div className="text-xs bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-lg space-y-1">
                    <div className="flex items-center justify-between text-emerald-800 font-semibold text-[11px]">
                      <span>Tanggapan dari: {note.respondedBy}</span>
                      <span className="font-mono text-[10px]">{formatDateTime(note.respondedAt)}</span>
                    </div>
                    <p className="text-slate-700">{note.responseNote}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
                  <span>Dikirim: {formatDate(note.createdAt)}</span>
                  <span className={`font-sans font-semibold ${
                    note.status === 'Selesai Diluruskan' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {note.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Buat Catatan Koreksi */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Kirim Catatan / Koreksi Data ke Petugas
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendCorrectionNote} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Modul Terkait
                </label>
                <select
                  value={noteModule}
                  onChange={(e) => setNoteModule(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="KEBUTUHAN">Kebutuhan Barang & Anggaran</option>
                  <option value="KIB_B">KIB B - Peralatan dan Mesin</option>
                  <option value="KIB_E">KIB E - Buku</option>
                  <option value="PENGADAAN">Pengadaan Barang</option>
                  <option value="UMUM">Administrasi / Laporan Umum</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Objek / Nama Barang Spesifik (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Laptop Lenovo / Printer Epson L3210"
                  value={noteItemTitle}
                  onChange={(e) => setNoteItemTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tingkat Urgensi
                </label>
                <div className="flex gap-2">
                  {(['Biasa', 'Penting', 'Segera Tindaklanjuti'] as const).map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => setNoteUrgency(urg)}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-center font-medium transition-colors ${
                        noteUrgency === urg
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {urg}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Uraian Catatan / Instruksi Koreksi *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan arahan koreksi data, verifikasi fisik, atau penyesuaian anggaran yang perlu dilakukan petugas..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Catatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
