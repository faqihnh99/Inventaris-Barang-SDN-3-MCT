import React, { useState, useEffect } from 'react';
import { SchoolSettings } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { School, Save, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

export const SchoolSettingsView: React.FC = () => {
  const { isSuperadmin } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSchoolSettings()
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [triggerRefresh]);

  if (loading || !settings) {
    return <div className="p-8 text-center text-slate-500">Memuat profil sekolah...</div>;
  }

  const handleLogoUpload = (side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({
          ...settings,
          [side === 'left' ? 'logoLeft' : 'logoRight']: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      alert('Hanya Administrator yang memiliki wewenang mengubah identitas sekolah.');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateSchoolSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <School className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Profil & Identitas Resmi Sekolah
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Informasi ini digunakan secara otomatis pada seluruh dokumen dinas, kop surat, dan label inventaris sekolah
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
          Profil dan identitas sekolah berhasil diperbarui dan tersimpan di database pusat.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 text-xs">
        {/* Logos */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <p className="font-semibold text-slate-800 text-xs">Logo Kop Surat (Kiri & Kanan)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Logo Kiri */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg border border-slate-300 bg-white p-1 flex items-center justify-center shrink-0">
                <img src={settings.logoLeft} alt="Logo Kiri" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-700 block">Logo Kiri (Pemda / Tut Wuri)</span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium">
                  <Upload className="w-3 h-3" />
                  <span>Ganti Logo Kiri</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('left', e)} className="hidden" />
                </label>
              </div>
            </div>

            {/* Logo Kanan */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg border border-slate-300 bg-white p-1 flex items-center justify-center shrink-0">
                <img src={settings.logoRight} alt="Logo Kanan" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-700 block">Logo Kanan (Sekolah)</span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-slate-700 font-medium">
                  <Upload className="w-3 h-3" />
                  <span>Ganti Logo Kanan</span>
                  <input type="file" accept="image/*" onChange={(e) => handleLogoUpload('right', e)} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Instansi & Sekolah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nama Instansi / Pemerintah Daerah *
            </label>
            <input
              type="text"
              required
              value={settings.agencyName}
              onChange={(e) => setSettings({ ...settings, agencyName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Nama Dinas Pendidikan *
            </label>
            <input
              type="text"
              required
              value={settings.educationDept}
              onChange={(e) => setSettings({ ...settings, educationDept: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">
              Nama Resmi Sekolah *
            </label>
            <input
              type="text"
              required
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">NPSN *</label>
            <input
              type="text"
              required
              value={settings.npsn}
              onChange={(e) => setSettings({ ...settings, npsn: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Alamat Lengkap */}
        <div className="space-y-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Alamat Jalan Sekolah *</label>
            <input
              type="text"
              required
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                placeholder="Kosongkan jika tidak ada"
                value={settings.village || ''}
                onChange={(e) => setSettings({ ...settings, village: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={settings.district}
                onChange={(e) => setSettings({ ...settings, district: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kabupaten / Kota</label>
              <input
                type="text"
                value={settings.regencyCity}
                onChange={(e) => setSettings({ ...settings, regencyCity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Provinsi</label>
              <input
                type="text"
                value={settings.province}
                onChange={(e) => setSettings({ ...settings, province: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={settings.postalCode}
                onChange={(e) => setSettings({ ...settings, postalCode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Kontak */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Email Sekolah</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Website</label>
            <input
              type="text"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving || !isSuperadmin}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Profil Sekolah'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
