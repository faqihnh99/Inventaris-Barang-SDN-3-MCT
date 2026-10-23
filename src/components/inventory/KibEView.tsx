import React, { useState, useEffect } from 'react';
import { InventoryItem, LocationItem } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatRupiah, exportToExcel } from '../../utils/formatters';
import { InventoryItemModal } from './InventoryItemModal';
import { TransferModal } from './TransferModal';
import { QrDetailModal } from '../qrcode/QrDetailModal';
import { ExcelImportModal } from '../import/ExcelImportModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Upload,
  ArrowRightLeft,
  QrCode,
  Edit2,
  Trash2,
} from 'lucide-react';

export const KibEView: React.FC = () => {
  const { canMutate } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [gradeClassFilter, setGradeClassFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [itemToTransfer, setItemToTransfer] = useState<InventoryItem | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [itemForQr, setItemForQr] = useState<InventoryItem | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [itms, locs] = await Promise.all([
        api.getInventoryItems({ kib: 'KIB_E' }),
        api.getLocations(),
      ]);
      setItems(itms);
      setLocations(locs);
    } catch (err) {
      console.error('Error loading KIB E data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  const filteredItems = items.filter((item) => {
    if (locationFilter && item.locationId !== locationFilter) return false;
    if (gradeClassFilter && item.gradeClass !== gradeClassFilter) return false;
    if (conditionFilter && item.condition !== conditionFilter) return false;
    if (subjectFilter && item.subject?.toLowerCase() !== subjectFilter.toLowerCase()) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      const match =
        item.name.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term) ||
        (item.isbn && item.isbn.toLowerCase().includes(term)) ||
        (item.author && item.author.toLowerCase().includes(term)) ||
        (item.publisher && item.publisher.toLowerCase().includes(term)) ||
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        (item.gradeClass && item.gradeClass.toLowerCase().includes(term)) ||
        item.locationName.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const totalValue = filteredItems.reduce((acc, i) => acc + (Number(i.totalValue) || 0), 0);
  const totalBooks = filteredItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteInventoryItem(itemToDelete.id);
      setItemToDelete(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredItems.map((item, idx) => ({
      'No': idx + 1,
      'Kode Buku': item.itemCode,
      'Judul Buku': item.name,
      'Mata Pelajaran': item.subject || '-',
      'Kelas': item.gradeClass || '-',
      'Pengarang': item.author || '-',
      'Penerbit': item.publisher || '-',
      'Tahun Terbit': item.year,
      'ISBN': item.isbn || '-',
      'Jumlah': item.quantity,
      'Satuan': item.unit,
      'Harga Satuan': item.unitPrice,
      'Nilai Total': item.totalValue,
      'Sumber Dana': item.fundSource,
      'Kondisi': item.condition,
      'Lokasi': item.locationName,
      'Keterangan': item.notes || '-',
    }));
    exportToExcel(exportData, `KIB_E_Buku_Pustaka_${new Date().getFullYear()}`, 'KIB_E');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              KIB E — Buku (Pelajaran & Pustaka)
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Buku Teks Kurikulum Merdeka, Fiksi & Literasi Pustaka</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredItems.length} Judul ({totalBooks} Eksemplar)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-slate-700">{formatRupiah(totalValue)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {canMutate && (
            <>
              <button
                onClick={() => {
                  setItemToEdit(null);
                  setIsItemModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Buku KIB E</span>
              </button>

              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Import Excel</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari judul buku, ISBN, pengarang, penerbit, mapel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={gradeClassFilter}
              onChange={(e) => setGradeClassFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Tingkat Kelas</option>
              <option value="Kelas 1">Kelas 1</option>
              <option value="Kelas 2">Kelas 2</option>
              <option value="Kelas 3">Kelas 3</option>
              <option value="Kelas 4">Kelas 4</option>
              <option value="Kelas 5">Kelas 5</option>
              <option value="Kelas 6">Kelas 6</option>
              <option value="Umum / SD">Umum / Perpustakaan</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Ruangan / Lokasi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-3 py-3 w-10 text-center">No</th>
                <th className="px-3 py-3">Kode Buku & ISBN</th>
                <th className="px-4 py-3">Judul Buku / Pengarang / Penerbit</th>
                <th className="px-3 py-3">Mapel & Kelas</th>
                <th className="px-3 py-3 text-center">Tahun</th>
                <th className="px-3 py-3 text-right">Jumlah</th>
                <th className="px-3 py-3 text-right">Harga Satuan</th>
                <th className="px-3 py-3 text-right">Nilai Total</th>
                <th className="px-3 py-3">Kondisi</th>
                <th className="px-3 py-3">Lokasi</th>
                <th className="px-3 py-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Memuat data KIB E...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Tidak ada buku KIB E yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 text-center font-mono text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <div className="font-semibold text-slate-900">{item.itemCode}</div>
                      <div className="text-[10px] text-slate-500">{item.isbn || 'Tanpa ISBN'}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-600">
                        {item.author ? `Oleh: ${item.author}` : ''}
                        {item.publisher ? ` · ${item.publisher}` : ''}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-medium text-slate-800">{item.subject || '-'}</span>
                      <span className="block text-[11px] text-indigo-700 font-semibold">{item.gradeClass || '-'}</span>
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums text-slate-600">
                      {item.year}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                      {item.quantity} <span className="font-normal text-slate-500 text-[10px]">{item.unit}</span>
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-600">
                      {formatRupiah(item.unitPrice)}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatRupiah(item.totalValue)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          item.condition === 'Baik'
                            ? 'text-emerald-700'
                            : item.condition === 'Rusak Ringan'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className="font-medium text-slate-700">{item.locationName}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            setItemForQr(item);
                            setIsQrModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="QR Code & Cetak Label"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {canMutate && (
                          <button
                            onClick={() => {
                              setItemToTransfer(item);
                              setIsTransferModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Pindahkan Buku"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canMutate && (
                          <button
                            onClick={() => {
                              setItemToEdit(item);
                              setIsItemModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canMutate && (
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Add/Edit Modal */}
      <InventoryItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={loadData}
        itemToEdit={itemToEdit}
        defaultKib="KIB_E"
      />

      {/* Transfer Location Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={loadData}
        item={itemToTransfer}
      />

      {/* QR Code & Label Print Modal */}
      <QrDetailModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        item={itemForQr}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
        targetKib="KIB_E"
        locations={locations}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Buku KIB E"
        itemName={itemToDelete?.name || ''}
        itemCode={itemToDelete?.itemCode}
        isDeleting={isDeleting}
      />
    </div>
  );
};
