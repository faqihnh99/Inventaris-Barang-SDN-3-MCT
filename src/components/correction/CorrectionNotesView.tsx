import React, { useState, useEffect } from 'react';
import { CorrectionNote } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { MessageSquareDiff, Send, CheckCircle2, Clock, X } from 'lucide-react';

export const CorrectionNotesView: React.FC = () => {
  const { user, isKepalaSekolah } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [notes, setNotes] = useState<CorrectionNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Response modal
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CorrectionNote | null>(null);
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState<CorrectionNote['status']>('Selesai Diluruskan');
  const [saving, setSaving] = useState(false);

  const loadNotes = async () => {
    try {
      const data = await api.getCorrectionNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [triggerRefresh]);

  const openRespondModal = (note: CorrectionNote) => {
    setSelectedNote(note);
    setResponseText(note.responseNote || '');
    setNewStatus(note.status === 'Selesai Diluruskan' ? 'Selesai Diluruskan' : 'Selesai Diluruskan');
    setIsRespondModalOpen(true);
  };

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote || !responseText.trim()) return;

    setSaving(true);
    try {
      await api.respondCorrectionNote(selectedNote.id, responseText.trim(), newStatus);
      setIsRespondModalOpen(false);
      loadNotes();
    } catch (err: any) {
      alert('Gagal mengirim tanggapan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <MessageSquareDiff className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Catatan & Arahan Koreksi Data dari Kepala Sekolah
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Media koordinasi resmi antara Kepala Sekolah (pemantau) dengan Pengurus Barang dan Tenaga Administrasi (pelaksana)
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Memuat catatan...</div>
        ) : notes.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Belum ada catatan koreksi yang terdaftar.
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{note.targetModule}</span>
                  {note.targetItemTitle && (
                    <span className="text-xs text-slate-600 font-medium">· {note.targetItemTitle}</span>
                  )}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      note.urgency === 'Segera Tindaklanjuti'
                        ? 'bg-red-50 text-red-700'
                        : note.urgency === 'Penting'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {note.urgency}
                  </span>
                </div>

                <span
                  className={`text-xs font-semibold ${
                    note.status === 'Selesai Diluruskan' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  Status: {note.status}
                </span>
              </div>

              {/* Note Content */}
              <div className="p-3 bg-amber-50/40 border border-amber-200/60 rounded-xl text-xs text-slate-800 leading-relaxed">
                <span className="font-semibold text-amber-900 block mb-1">
                  Catatan dari {note.headmasterName}:
                </span>
                "{note.noteText}"
              </div>

              {/* Response if present */}
              {note.responseNote && (
                <div className="p-3 bg-emerald-50/40 border border-emerald-200/60 rounded-xl text-xs text-slate-800 leading-relaxed space-y-1">
                  <div className="flex items-center justify-between font-semibold text-emerald-900 text-[11px]">
                    <span>Tindak Lanjut oleh: {note.respondedBy}</span>
                    <span className="font-mono text-[10px] text-emerald-700">
                      {formatDateTime(note.respondedAt)}
                    </span>
                  </div>
                  <p className="text-slate-700">{note.responseNote}</p>
                </div>
              )}

              {/* Footer and Respond Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="font-mono">Dikirim: {formatDateTime(note.createdAt)}</span>

                {!isKepalaSekolah && (
                  <button
                    onClick={() => openRespondModal(note)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium text-xs transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    <span>Tanggapi / Perbarui Status</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Tanggapan */}
      {isRespondModalOpen && selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Tanggapi Catatan Koreksi Kepala Sekolah
              </h3>
              <button onClick={() => setIsRespondModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSendResponse} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700">
                <span className="font-semibold block mb-0.5">Arahan:</span>
                "{selectedNote.noteText}"
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Tindakan Penyesuaian / Tanggapan Staf *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan perbaikan data atau hasil pengecekan fisik yang telah dilakukan..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Tindak Lanjut</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                >
                  <option value="Sedang Ditindaklanjuti">Sedang Ditindaklanjuti</option>
                  <option value="Selesai Diluruskan">Selesai Diluruskan (Terverifikasi)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRespondModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {saving ? 'Mengirim...' : 'Simpan Tanggapan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
