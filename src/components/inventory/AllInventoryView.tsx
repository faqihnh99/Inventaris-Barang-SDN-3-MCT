import React, { useState, useEffect } from 'react';
import { InventoryItem, LocationItem } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatRupiah, exportToExcel } from '../../utils/formatters';
import { InventoryItemModal } from './InventoryItemModal';
import { TransferModal } from './TransferModal';
import { QrDetailModal } from '../qrcode/QrDetailModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Boxes,
  Search,
  Filter,
  Download,
  Plus,
  ArrowRightLeft,
  QrCode,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const AllInventoryView: React.FC = () => {
  const { canMutate } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [kibFilter, setKibFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [fundFilter, setFundFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Sorting & Pagination
  const [sortField, setSortField] = useState<keyof InventoryItem>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [itemToTransfer, setItemToTransfer] = useState<InventoryItem | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [itemForQr, setItemForQr] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [itms, locs] = await Promise.all([
        api.getInventoryItems(),
        api.getLocations(),
      ]);
      setItems(itms);
      setLocations(locs);
    } catch (err) {
      console.error('Error loading all inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  const filteredItems = items
    .filter((item) => {
      if (kibFilter && item.kib !== kibFilter) return false;
      if (locationFilter && item.locationId !== locationFilter) return false;
      if (conditionFilter && item.condition !== conditionFilter) return false;
      if (fundFilter && item.fundSource !== fundFilter) return false;
      if (yearFilter && String(item.year) !== yearFilter) return false;

      if (search.trim()) {
        const term = search.toLowerCase();
        const match =
          item.name.toLowerCase().includes(term) ||
          item.itemCode.toLowerCase().includes(term) ||
          (item.brandModel && item.brandModel.toLowerCase().includes(term)) ||
          (item.isbn && item.isbn.toLowerCase().includes(term)) ||
          (item.author && item.author.toLowerCase().includes(term)) ||
          item.locationName.toLowerCase().includes(term);
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const valA = (a as any)[sortField];
      const valB = (b as any)[sortField];
      if (valA === valB) return 0;
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      const res = valA > valB ? 1 : -1;
      return sortOrder === 'asc' ? res : -res;
    });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalValue = filteredItems.reduce((acc, i) => acc + (Number(i.totalValue) || 0), 0);
  const totalPhysicalItems = filteredItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0);

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
    const data = filteredItems.map((item, idx) => ({
      'No': idx + 1,
      'KIB': item.kib === 'KIB_B' ? 'KIB B (Peralatan)' : 'KIB E (Buku)',
      'Kode Barang': item.itemCode,
      'Nama / Judul': item.name,
      'Merk / Pengarang': item.brandModel || item.author || '-',
      'Tahun': item.year,
      'Jumlah': item.quantity,
      'Satuan': item.unit,
      'Harga Satuan': item.unitPrice,
      'Nilai Total': item.totalValue,
      'Sumber Dana': item.fundSource,
      'Kondisi': item.condition,
      'Lokasi': item.locationName,
      'Register': item.registerNumber || '-',
    }));
    exportToExcel(data, `Inventaris_Lengkap_Sekolah_${new Date().getFullYear()}`, 'Semua_Inventaris');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Semua Inventaris Barang Sekolah
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Rekap Terpadu KIB B & KIB E</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredItems.length} Data ({totalPhysicalItems} Unit Fisik)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-slate-700">{formatRupiah(totalValue)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canMutate && (
            <button
              onClick={() => {
                setItemToEdit(null);
                setIsItemModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Barang</span>
            </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, kode, merk, ISBN, lokasi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* KIB Filter */}
          <div>
            <select
              value={kibFilter}
              onChange={(e) => {
                setKibFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">Semua KIB (B & E)</option>
              <option value="KIB_B">KIB B (Peralatan & Mesin)</option>
              <option value="KIB_E">KIB E (Buku)</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={(e) => {
                setLocationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Lokasi</option>
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
              onChange={(e) => {
                setConditionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>

          {/* Fund Filter */}
          <div>
            <select
              value={fundFilter}
              onChange={(e) => {
                setFundFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Sumber Dana</option>
              <option value="BOS Reguler">BOS Reguler</option>
              <option value="BOS Kinerja">BOS Kinerja</option>
              <option value="BOP Daerah">BOP Daerah</option>
              <option value="Komite Sekolah">Komite</option>
              <option value="Hibah / Bantuan">Hibah</option>
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
                <th className="px-3 py-3">Kode Barang</th>
                <th className="px-4 py-3">Nama Barang / Judul Buku</th>
                <th className="px-3 py-3">KIB</th>
                <th className="px-3 py-3 text-right">Jumlah</th>
                <th className="px-3 py-3 text-center">Tahun</th>
                <th className="px-3 py-3">Kondisi</th>
                <th className="px-3 py-3">Lokasi</th>
                <th className="px-3 py-3 text-right">Nilai Total</th>
                <th className="px-3 py-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Memuat inventaris...
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Tidak ada barang inventaris yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 text-center font-mono text-slate-500 tabular-nums">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>

                    <td className="px-3 py-3 font-mono font-semibold text-slate-900">
                      {item.itemCode}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.brandModel || item.author || ''}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        item.kib === 'KIB_B' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.kib === 'KIB_B' ? 'KIB B (Peralatan)' : 'KIB E (Buku)'}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                      {item.quantity} <span className="font-normal text-slate-500 text-[10px]">{item.unit}</span>
                    </td>

                    <td className="px-3 py-3 text-center font-mono tabular-nums text-slate-600">
                      {item.year}
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

                    <td className="px-3 py-3 font-medium text-slate-700">
                      {item.locationName}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatRupiah(item.totalValue)}
                    </td>

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
                            title="Pindahkan Lokasi"
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
                            title="Edit"
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span>
            Menampilkan baris {(currentPage - 1) * pageSize + 1} -{' '}
            {Math.min(currentPage * pageSize, filteredItems.length)} dari {filteredItems.length} total
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums font-medium">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <InventoryItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={loadData}
        itemToEdit={itemToEdit}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={loadData}
        item={itemToTransfer}
      />

      <QrDetailModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        item={itemForQr}
      />

      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Item Inventaris"
        itemName={itemToDelete?.name || ''}
        itemCode={itemToDelete?.itemCode}
        isDeleting={isDeleting}
      />
    </div>
  );
};
