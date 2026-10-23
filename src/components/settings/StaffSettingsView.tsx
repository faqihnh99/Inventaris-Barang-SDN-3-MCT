import React, { useState, useEffect } from 'react';
import { StaffSettings, SchoolSettings } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { UserCog, Save, Check, Eye } from 'lucide-react';

export const StaffSettingsView: React.FC = () => {
  const { user } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [staff, setStaff] = useState<StaffSettings | null>(null);
  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    Promise.all([api.getStaffSettings(), api.getSchoolSettings()])
      .then(([stf, sch]) => {
        setStaff(stf);
        setSchool(sch);
        setLoading(false);
      })
      .catch(console.error);
  }, [triggerRefresh]);

  if (loading || !staff) {
    return <div className="p-8 text-center text-slate-500">Memuat data pejabat dan petugas...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateStaffSettings(staff);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert('Gagal menyimpan perubahan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <UserCog className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Pengaturan Pejabat & Pengurus Barang Pembantu
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ubah nama, NIP, dan jabatan pejabat penandatangan dokumen dinas (Kepala Sekolah, Pengurus Barang, Pengurus Barang Pembantu, TU)
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Nama pejabat berhasil diperbarui dan langsung diterapkan pada seluruh lembar laporan dan berita acara dinas.</span>
        </div>
      )}

      {/* Live Signature Block Preview */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold border-b border-slate-100 pb-2">
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>Pratinjau Lembar Tanda Tangan Resmi Dokumen:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-center text-slate-900 pt-2">
          {/* Kepala Sekolah */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500">Mengetahui,</p>
            <p className="font-semibold text-slate-800">{staff.headmasterTitle || 'Kepala Sekolah'}</p>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
              (Tanda Tangan)
            </div>
            <p className="font-bold underline uppercase">{staff.headmasterName}</p>
            <p className="font-mono text-[11px] text-slate-500">NIP. {staff.headmasterNip || '-'}</p>
          </div>

          {/* Pengurus Barang */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-500">&nbsp;</p>
            <p className="font-semibold text-slate-800">{staff.propertyOfficerTitle || 'Pengurus Barang'}</p>
            <div className="h-16 flex items-center justify-center text-slate-300 italic text-[10px]">
              (Tanda Tangan)
            </div>
            <p className="font-bold underline uppercase">{staff.propertyOfficerName}</p>
            <p className="font-mono text-[11px] text-slate-500">NIP. {staff.propertyOfficerNip || '-'}</p>
          </div>

          {/* Pengurus Barang Pembantu */}
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
            <p className="text-indigo-800">{school?.regencyCity || 'Nusantara'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-semibold text-indigo-950">{staff.assistantPropertyOfficerTitle || 'Pengurus Barang Pembantu'}</p>
            <div className="h-16 flex items-center justify-center text-indigo-300 italic text-[10px]">
              (Tanda Tangan)
            </div>
            <p className="font-bold underline uppercase text-indigo-950">{staff.assistantPropertyOfficerName}</p>
            <p className="font-mono text-[11px] text-indigo-700">NIP. {staff.assistantPropertyOfficerNip || '-'}</p>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Section 1: Pengurus Barang Pembantu (Featured prominently) */}
        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-indigo-950">
              1. Pengurus Barang Pembantu
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">
              Dapat Diganti Kapan Saja
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap & Gelar Pengurus Barang Pembantu *
              </label>
              <input
                type="text"
                required
                value={staff.assistantPropertyOfficerName}
                onChange={(e) =>
                  setStaff({ ...staff, assistantPropertyOfficerName: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">NIP (Boleh Kosong)</label>
              <input
                type="text"
                value={staff.assistantPropertyOfficerNip}
                onChange={(e) =>
                  setStaff({ ...staff, assistantPropertyOfficerNip: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Jabatan Resmi</label>
            <input
              type="text"
              value={staff.assistantPropertyOfficerTitle}
              onChange={(e) =>
                setStaff({ ...staff, assistantPropertyOfficerTitle: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Section 2: Kepala Sekolah */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-900">2. Kepala Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap & Gelar Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={staff.headmasterName}
                onChange={(e) => setStaff({ ...staff, headmasterName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={staff.headmasterNip}
                onChange={(e) => setStaff({ ...staff, headmasterNip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Jabatan Resmi</label>
            <input
              type="text"
              value={staff.headmasterTitle}
              onChange={(e) => setStaff({ ...staff, headmasterTitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Section 3: Pengurus Barang Utama */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-900">3. Pengurus Barang Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap & Gelar Pengurus Barang *
              </label>
              <input
                type="text"
                required
                value={staff.propertyOfficerName}
                onChange={(e) => setStaff({ ...staff, propertyOfficerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">NIP Pengurus Barang</label>
              <input
                type="text"
                value={staff.propertyOfficerNip}
                onChange={(e) => setStaff({ ...staff, propertyOfficerNip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Jabatan Resmi</label>
            <input
              type="text"
              value={staff.propertyOfficerTitle}
              onChange={(e) => setStaff({ ...staff, propertyOfficerTitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Section 4: Tenaga Administrasi */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <h3 className="font-bold text-sm text-slate-900">4. Tenaga Administrasi Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap Tenaga Administrasi *
              </label>
              <input
                type="text"
                required
                value={staff.adminStaffName}
                onChange={(e) => setStaff({ ...staff, adminStaffName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">NIP (Boleh Kosong)</label>
              <input
                type="text"
                value={staff.adminStaffNip}
                onChange={(e) => setStaff({ ...staff, adminStaffNip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Pejabat'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
