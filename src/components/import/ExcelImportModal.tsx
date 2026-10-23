import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { InventoryKIB, LocationItem } from '../../types';
import { api } from '../../api';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  targetKib: InventoryKIB;
  locations: LocationItem[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetKib,
  locations,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [errorRows, setErrorRows] = useState<Array<{ row: number; data: any; errors: string[] }>>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Download official template
  const handleDownloadTemplate = () => {
    let headers: string[] = [];
    let sampleData: Record<string, any>[] = [];

    if (targetKib === 'KIB_B') {
      sampleData = [
        {
          'No': 1,
          'Kode Barang': '02.06.01.01.101',
          'Nama Barang': 'Printer Canon PIXMA G3010',
          'Merk/Type': 'Canon Ink Tank G3010',
          'Spesifikasi': 'All-in-One Wireless WiFi USB',
          'Nomor Register': 'REG-2026-B-101',
          'Tahun Perolehan': 2026,
          'Jumlah': 2,
          'Satuan': 'Unit',
          'Harga Satuan': 2300000,
          'Nilai Total': 4600000,
          'Sumber Dana': 'BOS Reguler',
          'Kondisi': 'Baik',
          'Penempatan': 'Ruang Guru',
          'Keterangan': 'Pengadaan semester 1',
        },
      ];
    } else {
      sampleData = [
        {
          'No': 1,
          'Kode Buku': '05.17.01.01.101',
          'Judul Buku': 'Buku IPAS Kelas 4',
          'Mata Pelajaran': 'Ilmu Pengetahuan Alam dan Sosial',
          'Kelas': 'Kelas 4',
          'Pengarang': 'Amalia Fitri dkk',
          'Penerbit': 'Pusat Perbukuan Kemendikbudristek',
          'Tahun Terbit': 2024,
          'ISBN': '978-602-244-374-2',
          'Jumlah': 32,
          'Satuan': 'Eksemplar',
          'Harga Satuan': 75000,
          'Nilai Total': 2400000,
          'Sumber Dana': 'BOS Reguler',
          'Kondisi': 'Baik',
          'Penempatan': 'Kelas 4',
          'Keterangan': 'Kurikulum Merdeka',
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Template_${targetKib}`);
    XLSX.writeFile(wb, `Template_Import_${targetKib}.xlsx`);
  };

  // 2. Read and validate Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      alert('Format file tidak didukung. Harap unggah file Excel (.xlsx atau .xls)');
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(ws);

        validateRows(json);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + err.message);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const validateRows = (rows: any[]) => {
    setParsedRows(rows);
    const valid: any[] = [];
    const errors: Array<{ row: number; data: any; errors: string[] }> = [];

    const locMap = new Map(locations.map((l) => [l.name.toLowerCase().trim(), l]));

    rows.forEach((r, idx) => {
      const rowNum = idx + 2; // header is row 1
      const rowErrors: string[] = [];

      const name = targetKib === 'KIB_B' ? r['Nama Barang'] : r['Judul Buku'];
      const code = targetKib === 'KIB_B' ? r['Kode Barang'] : r['Kode Buku'];
      const qty = Number(r['Jumlah']);
      const price = Number(r['Harga Satuan'] || 0);
      const locStr = (r['Penempatan'] || r['Lokasi Penempatan'] || '').toString().toLowerCase().trim();

      if (!name) rowErrors.push('Nama Barang / Judul Buku tidak boleh kosong');
      if (!code) rowErrors.push('Kode Barang / Buku tidak boleh kosong');
      if (isNaN(qty) || qty <= 0) rowErrors.push('Jumlah harus angka lebih dari 0');
      if (isNaN(price) || price < 0) rowErrors.push('Harga satuan harus angka positif');

      let locationId = locations[0]?.id || 'loc-tu';
      let locationName = locations[0]?.name || 'Ruang Tata Usaha';

      if (locStr) {
        if (locMap.has(locStr)) {
          const matched = locMap.get(locStr)!;
          locationId = matched.id;
          locationName = matched.name;
        } else {
          locationName = r['Penempatan'] || 'Ruang Tata Usaha';
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, data: r, errors: rowErrors });
      } else {
        valid.push({
          kib: targetKib,
          itemCode: String(code),
          name: String(name),
          brandModel: r['Merk/Type'] || undefined,
          specification: r['Spesifikasi'] || undefined,
          registerNumber: r['Nomor Register'] || undefined,
          year: Number(r['Tahun Perolehan'] || r['Tahun Terbit'] || new Date().getFullYear()),
          quantity: qty,
          unit: r['Satuan'] || (targetKib === 'KIB_B' ? 'Unit' : 'Eksemplar'),
          unitPrice: price,
          totalValue: qty * price,
          fundSource: r['Sumber Dana'] || 'BOS Reguler',
          condition: (r['Kondisi'] === 'Rusak Berat' || r['Kondisi'] === 'Rusak Ringan') ? r['Kondisi'] : 'Baik',
          locationId,
          locationName,
          notes: r['Keterangan'] || undefined,
          subject: r['Mata Pelajaran'] || undefined,
          gradeClass: r['Kelas'] || undefined,
          author: r['Pengarang'] || undefined,
          publisher: r['Penerbit'] || undefined,
          isbn: r['ISBN'] ? String(r['ISBN']) : undefined,
        });
      }
    });

    setValidRows(valid);
    setErrorRows(errors);
  };

  // 3. Confirm and execute import to database
  const handleConfirmImport = async () => {
    if (validRows.length === 0) {
      alert('Tidak ada data valid yang dapat disimpan.');
      return;
    }

    setImporting(true);
    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      try {
        await api.createInventoryItem(row);
        successCount++;
      } catch (err) {
        failCount++;
      }
    }

    setImporting(false);
    setImportResult(`Import selesai: ${successCount} data berhasil disimpan ke database.${failCount > 0 ? ` (${failCount} gagal karena duplikasi kode).` : ''}`);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Import Excel — {targetKib === 'KIB_B' ? 'KIB B (Peralatan & Mesin)' : 'KIB E (Buku)'}
              </h3>
              <p className="text-xs text-slate-500">
                Unggah file Excel sesuai format struktur tabel resmi SIM-ASET
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Download Template */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-slate-800">1. Unduh Template Excel Resmi</p>
            <p className="text-slate-500">
              Gunakan template standar dengan kolom terstruktur agar validasi data akurat
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Download Template</span>
          </button>
        </div>

        {/* Step 2: Upload File */}
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-800">
            {file ? file.name : 'Pilih file Excel dari komputer Anda'}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Mendukung format .xlsx dan .xls</p>
          <label className="mt-3 inline-block cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors">
            <span>Pilih File Excel</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Validation Summary */}
        {parsedRows.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900">{validRows.length} Data Valid</p>
                  <p className="text-emerald-700 text-[11px]">Siap disimpan ke database</p>
                </div>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">{errorRows.length} Data Bermasalah</p>
                  <p className="text-red-700 text-[11px]">Tidak akan diimport</p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {errorRows.length > 0 && (
              <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl max-h-36 overflow-y-auto text-xs space-y-1">
                <p className="font-semibold text-red-900">Rincian Kesalahan Baris Excel:</p>
                {errorRows.map((err, i) => (
                  <p key={i} className="text-red-700 text-[11px]">
                    • Baris {err.row}: {err.errors.join(', ')}
                  </p>
                ))}
              </div>
            )}

            {/* Preview of Valid Data */}
            {validRows.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Kode</th>
                      <th className="px-3 py-2">Nama / Judul</th>
                      <th className="px-3 py-2 text-right">Jumlah</th>
                      <th className="px-3 py-2">Lokasi</th>
                      <th className="px-3 py-2">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validRows.slice(0, 10).map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-1.5 font-mono text-[11px] text-slate-600">{r.itemCode}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-900">{r.name}</td>
                        <td className="px-3 py-1.5 text-right font-mono tabular-nums">{r.quantity} {r.unit}</td>
                        <td className="px-3 py-1.5 text-slate-600">{r.locationName}</td>
                        <td className="px-3 py-1.5 text-slate-700">{r.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {importResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
            {importResult}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Tutup
          </button>

          {validRows.length > 0 && !importResult && (
            <button
              onClick={handleConfirmImport}
              disabled={importing}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {importing ? 'Menyimpan ke Database...' : `Konfirmasi Import (${validRows.length} Data)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
