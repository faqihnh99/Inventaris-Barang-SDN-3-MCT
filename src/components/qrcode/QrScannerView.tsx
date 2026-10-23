import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { api } from '../../api';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { ScanLine, Search, PackageCheck, AlertCircle, QrCode } from 'lucide-react';

export const QrScannerView: React.FC = () => {
  const [inputCode, setInputCode] = useState('');
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (codeToSearch = inputCode) => {
    if (!codeToSearch.trim()) return;
    setSearching(true);
    setSearched(true);
    setFoundItem(null);

    try {
      // If user pasted raw JSON from our QR payload
      let finalCode = codeToSearch.trim();
      if (finalCode.startsWith('{') && finalCode.endsWith('}')) {
        try {
          const parsed = JSON.parse(finalCode);
          if (parsed.kode_barang) finalCode = parsed.kode_barang;
          else if (parsed.simaset_id) {
            const item = await api.getInventoryItem(parsed.simaset_id);
            setFoundItem(item);
            setSearching(false);
            return;
          }
        } catch (e) {
          // ignore
        }
      }

      const all = await api.getInventoryItems({ search: finalCode });
      const exact = all.find(
        (i) =>
          i.itemCode.toLowerCase() === finalCode.toLowerCase() ||
          i.id === finalCode ||
          (i.registerNumber && i.registerNumber.toLowerCase() === finalCode.toLowerCase())
      );
      setFoundItem(exact || (all.length > 0 ? all[0] : null));
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <ScanLine className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Pindai & Verifikasi QR Code Aset Fisik
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Verifikasi barang fisik di ruangan dengan memasukkan kode barang, nomor register, atau payload QR Code hasil pemindaian smartphone
        </p>
      </div>

      {/* Input / Scanner simulation box */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Ketik atau tempel kode barang / hasil scan QR (contoh: 02.06.01.01.001)..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => handleLookup()}
            disabled={searching}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-2 text-xs"
          >
            <Search className="w-4 h-4" />
            <span>{searching ? 'Mencari...' : 'Periksa Aset'}</span>
          </button>
        </div>

        {/* Quick Test Codes */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-1">
          <span>Contoh cepat:</span>
          <button
            onClick={() => {
              setInputCode('02.06.01.01.001');
              handleLookup('02.06.01.01.001');
            }}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded"
          >
            Printer Epson (02.06.01.01.001)
          </button>
          <button
            onClick={() => {
              setInputCode('02.06.01.02.002');
              handleLookup('02.06.01.02.002');
            }}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded"
          >
            Laptop Lenovo (02.06.01.02.002)
          </button>
          <button
            onClick={() => {
              setInputCode('05.17.01.01.001');
              handleLookup('05.17.01.01.001');
            }}
            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono rounded"
          >
            Buku Bhs Indo (05.17.01.01.001)
          </button>
        </div>
      </div>

      {/* Result Card */}
      {foundItem && (
        <div className="p-6 bg-white rounded-2xl border-2 border-indigo-500 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Aset Terverifikasi di Database
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{foundItem.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  Kode: {foundItem.itemCode} · Reg: {foundItem.registerNumber || '-'}
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                foundItem.condition === 'Baik'
                  ? 'bg-emerald-50 text-emerald-700'
                  : foundItem.condition === 'Rusak Ringan'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              Kondisi: {foundItem.condition}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-200">
            <div>
              <span className="text-slate-500 block">Kategori KIB</span>
              <span className="font-semibold text-slate-900">
                {foundItem.kib === 'KIB_B' ? 'KIB B (Peralatan)' : 'KIB E (Buku)'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Lokasi Fisik</span>
              <span className="font-semibold text-indigo-700">{foundItem.locationName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Jumlah Tersedia</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {foundItem.quantity} {foundItem.unit}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Nilai Aset</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatRupiah(foundItem.totalValue)}
              </span>
            </div>
          </div>

          <div className="text-xs space-y-1 text-slate-700">
            {foundItem.brandModel && (
              <p>
                <strong>Merk / Tipe:</strong> {foundItem.brandModel}
              </p>
            )}
            {foundItem.specification && (
              <p>
                <strong>Spesifikasi:</strong> {foundItem.specification}
              </p>
            )}
            {foundItem.author && (
              <p>
                <strong>Pengarang:</strong> {foundItem.author} · <strong>Penerbit:</strong>{' '}
                {foundItem.publisher}
              </p>
            )}
            {foundItem.notes && (
              <p>
                <strong>Keterangan:</strong> {foundItem.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {searched && !searching && !foundItem && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">Barang Tidak Ditemukan</p>
          <p className="text-xs text-slate-500">
            Tidak ada inventaris dengan kode "{inputCode}". Pastikan kode telah sesuai atau cari di menu Semua Inventaris.
          </p>
        </div>
      )}
    </div>
  );
};
