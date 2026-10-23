import React, { useState, useEffect } from 'react';
import { LetterheadSettings, SchoolSettings } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { FileText, Save, RotateCcw, Eye, Sliders, Check } from 'lucide-react';

export const LetterheadSettingsView: React.FC = () => {
  const { isSuperadmin } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [letterhead, setLetterhead] = useState<LetterheadSettings | null>(null);
  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [initialLetterhead, setInitialLetterhead] = useState<LetterheadSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    Promise.all([api.getLetterheadSettings(), api.getSchoolSettings()])
      .then(([lth, sch]) => {
        setLetterhead(lth);
        setInitialLetterhead(lth);
        setSchool(sch);
        setLoading(false);
      })
      .catch(console.error);
  }, [triggerRefresh]);

  if (loading || !letterhead || !school) {
    return <div className="p-8 text-center text-slate-500">Memuat konfigurasi kop surat...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      alert('Hanya Administrator yang memiliki hak mengubah konfigurasi kop surat.');
      return;
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateLetterheadSettings(letterhead);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (initialLetterhead && window.confirm('Kembalikan konfigurasi ke pengaturan sebelumnya?')) {
      setLetterhead({ ...initialLetterhead });
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Pengaturan & Pratinjau Kop Surat Resmi
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ubah susunan, ukuran logo, jenis huruf, dan ketebalan garis kop surat dinas secara visual tanpa mengubah kode program
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Semula</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan kop surat berhasil disimpan dan langsung diterapkan pada seluruh dokumen PDF, Word, dan Cetak.</span>
        </div>
      )}

      {/* WYSIWYG Live Preview Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Pratinjau Langsung Kop Surat (Live Preview):</span>
          </span>
          <span className="text-slate-400 font-normal">Ukuran Kertas: {letterhead.paperSize} ({letterhead.orientation})</span>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-200 shadow-sm">
          <div
            className="border-b-double pb-3"
            style={{
              fontFamily: letterhead.fontFamily,
              color: letterhead.textColor,
              borderBottomWidth: `${letterhead.borderThickness * 2}px`,
              borderBottomColor: letterhead.textColor,
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Logo Kiri */}
              {letterhead.showLogoLeft && (
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: `${letterhead.logoSizePx}px`, height: `${letterhead.logoSizePx}px` }}
                >
                  <img
                    src={school.logoLeft || '/assets/logo-tutwuri.svg'}
                    alt="Logo Kiri"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {/* Teks Identitas Tengah */}
              <div className="text-center flex-1 leading-tight space-y-0.5">
                {letterhead.showAgency && (
                  <p
                    className="font-bold uppercase tracking-wide"
                    style={{ fontSize: letterhead.subtitleFontSize }}
                  >
                    {school.agencyName}
                  </p>
                )}
                {letterhead.showEducationDept && (
                  <p
                    className="font-bold uppercase tracking-wide"
                    style={{ fontSize: letterhead.subtitleFontSize }}
                  >
                    {school.educationDept}
                  </p>
                )}
                {letterhead.showSchoolName && (
                  <h1
                    className="font-extrabold uppercase tracking-wider my-0.5"
                    style={{ fontSize: letterhead.titleFontSize }}
                  >
                    {school.schoolName}
                  </h1>
                )}
                {letterhead.showAddress && (
                  <p
                    className="text-slate-600 mt-1"
                    style={{ fontSize: letterhead.bodyFontSize }}
                  >
                    {[school.address, school.village, school.district, school.regencyCity].filter(Boolean).join(', ')}{school.postalCode ? ` ${school.postalCode}` : ''}
                  </p>
                )}
                {letterhead.showContactInfo && (
                  <p
                    className="text-slate-500 font-mono"
                    style={{ fontSize: `calc(${letterhead.bodyFontSize} - 1px)` }}
                  >
                    Telp: {school.phone} · Email: {school.email} · NPSN: {school.npsn}
                  </p>
                )}
              </div>

              {/* Logo Kanan */}
              {letterhead.showLogoRight && (
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ width: `${letterhead.logoSizePx}px`, height: `${letterhead.logoSizePx}px` }}
                >
                  <img
                    src={school.logoRight || '/assets/logo-sekolah.svg'}
                    alt="Logo Kanan"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Controls */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-xs">
        {/* Visibility Toggles */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-800 text-xs">Elemen yang Ditampilkan pada Kop</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'showLogoLeft', label: 'Logo Kiri (Pemda / Tut Wuri)' },
              { id: 'showLogoRight', label: 'Logo Kanan (Sekolah)' },
              { id: 'showAgency', label: 'Nama Instansi Pemda' },
              { id: 'showEducationDept', label: 'Nama Dinas Pendidikan' },
              { id: 'showSchoolName', label: 'Nama Resmi Sekolah' },
              { id: 'showAddress', label: 'Alamat Lengkap' },
              { id: 'showContactInfo', label: 'Telepon, Email & NPSN' },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(letterhead as any)[item.id]}
                  onChange={(e) =>
                    setLetterhead({ ...letterhead, [item.id]: e.target.checked })
                  }
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-medium text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Styling, Borders, & Typography */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Jenis Huruf (Font Family)</label>
            <select
              value={letterhead.fontFamily}
              onChange={(e) => setLetterhead({ ...letterhead, fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="Arial, Helvetica, sans-serif">Arial / Helvetica (Standar Dinas)</option>
              <option value="'Times New Roman', Times, serif">Times New Roman (Klasik Resmi)</option>
              <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Modern)</option>
              <option value="Georgia, serif">Georgia</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Ketebalan Garis Pembatas (px)</label>
            <input
              type="range"
              min={1}
              max={6}
              value={letterhead.borderThickness}
              onChange={(e) =>
                setLetterhead({ ...letterhead, borderThickness: Number(e.target.value) })
              }
              className="w-full mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Tipis (1px)</span>
              <span className="font-bold text-slate-900">{letterhead.borderThickness}px</span>
              <span>Tebal (6px)</span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Ukuran Logo (px)</label>
            <input
              type="range"
              min={50}
              max={110}
              value={letterhead.logoSizePx}
              onChange={(e) =>
                setLetterhead({ ...letterhead, logoSizePx: Number(e.target.value) })
              }
              className="w-full mt-2"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Kecil (50px)</span>
              <span className="font-bold text-slate-900">{letterhead.logoSizePx}px</span>
              <span>Besar (110px)</span>
            </div>
          </div>
        </div>

        {/* Font Sizes & Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Ukuran Judul Sekolah</label>
            <select
              value={letterhead.titleFontSize}
              onChange={(e) => setLetterhead({ ...letterhead, titleFontSize: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="14px">14px (Sedang)</option>
              <option value="16px">16px (Standar)</option>
              <option value="18px">18px (Besar)</option>
              <option value="20px">20px (Sangat Besar)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Ukuran Subjudul / Dinas</label>
            <select
              value={letterhead.subtitleFontSize}
              onChange={(e) =>
                setLetterhead({ ...letterhead, subtitleFontSize: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="11px">11px</option>
              <option value="13px">13px (Standar)</option>
              <option value="15px">15px</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Ukuran Teks Alamat & Kontak</label>
            <select
              value={letterhead.bodyFontSize}
              onChange={(e) => setLetterhead({ ...letterhead, bodyFontSize: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="9px">9px</option>
              <option value="10px">10px (Standar)</option>
              <option value="11px">11px</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving || !isSuperadmin}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Kop Surat'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
