import React, { useState, useEffect } from 'react';
import { LocationItem, LocationHistory, InventoryItem } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  MapPin,
  Plus,
  ArrowRightLeft,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  History,
  Building,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const LocationsView: React.FC<{ defaultTab?: 'locations' | 'transfers' }> = ({
  defaultTab = 'locations',
}) => {
  const { canMutate } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [activeTab, setActiveTab] = useState<'locations' | 'transfers'>(defaultTab);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [histories, setHistories] = useState<LocationHistory[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Location modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationItem | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit Transfer modal state
  const [isEditHistModalOpen, setIsEditHistModalOpen] = useState(false);
  const [editingHist, setEditingHist] = useState<LocationHistory | null>(null);
  const [histTransferDate, setHistTransferDate] = useState('');
  const [histFromLocationId, setHistFromLocationId] = useState('');
  const [histToLocationId, setHistToLocationId] = useState('');
  const [histQuantityMoved, setHistQuantityMoved] = useState<number>(1);
  const [histOfficerName, setHistOfficerName] = useState('');
  const [histNotes, setHistNotes] = useState('');
  const [histSyncItemLocation, setHistSyncItemLocation] = useState(true);
  const [savingHist, setSavingHist] = useState(false);

  // Delete Transfer modal state
  const [histToDelete, setHistToDelete] = useState<LocationHistory | null>(null);
  const [isDeletingHist, setIsDeletingHist] = useState(false);
  const [revertLocationOnDelete, setRevertLocationOnDelete] = useState(false);

  const loadData = async () => {
    try {
      const [locs, hists, items] = await Promise.all([
        api.getLocations(),
        api.getLocationHistories(),
        api.getInventoryItems(),
      ]);
      setLocations(locs);
      setHistories(hists);
      setInventoryItems(items);
    } catch (err) {
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  const openAddModal = () => {
    setEditingLoc(null);
    setName('');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: LocationItem) => {
    setEditingLoc(loc);
    setName(loc.name);
    setDescription(loc.description || '');
    setIsActive(loc.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (editingLoc) {
        await api.updateLocation(editingLoc.id, {
          name: name.trim(),
          description: description.trim(),
          isActive,
        });
      } else {
        await api.createLocation(name.trim(), description.trim());
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Gagal menyimpan lokasi: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditHistModal = (hist: LocationHistory) => {
    setEditingHist(hist);
    setHistTransferDate(hist.transferDate || new Date().toISOString().split('T')[0]);
    setHistFromLocationId(hist.fromLocationId);
    setHistToLocationId(hist.toLocationId);
    setHistQuantityMoved(hist.quantityMoved || 1);
    setHistOfficerName(hist.officerName || '');
    setHistNotes(hist.notes || '');
    setHistSyncItemLocation(true);
    setIsEditHistModalOpen(true);
  };

  const handleSaveEditHist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHist) return;
    if (!histToLocationId) {
      alert('Ruangan tujuan wajib dipilih.');
      return;
    }

    const fromLoc = locations.find((l) => l.id === histFromLocationId);
    const toLoc = locations.find((l) => l.id === histToLocationId);

    setSavingHist(true);
    try {
      await api.updateLocationHistory(editingHist.id, {
        transferDate: histTransferDate,
        fromLocationId: histFromLocationId,
        fromLocationName: fromLoc ? fromLoc.name : editingHist.fromLocationName,
        toLocationId: histToLocationId,
        toLocationName: toLoc ? toLoc.name : editingHist.toLocationName,
        quantityMoved: Number(histQuantityMoved),
        officerName: histOfficerName.trim(),
        notes: histNotes.trim(),
        syncItemLocation: histSyncItemLocation,
      });
      setIsEditHistModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Gagal memperbarui riwayat perpindahan: ' + err.message);
    } finally {
      setSavingHist(false);
    }
  };

  const handleConfirmDeleteHist = async () => {
    if (!histToDelete) return;
    setIsDeletingHist(true);
    try {
      await api.deleteLocationHistory(histToDelete.id, revertLocationOnDelete);
      setHistToDelete(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete history:', err);
    } finally {
      setIsDeletingHist(false);
    }
  };

  // Calculate live asset count for each location
  const getItemCountForLoc = (locId: string) => {
    return inventoryItems
      .filter((i) => i.locationId === locId)
      .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Master Lokasi & Riwayat Perpindahan Barang
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Manajemen Ruangan, Penempatan Aset & Audit Mutasi Fisik</span>
          </div>
        </div>

        {/* Tab Switcher & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'locations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Master Ruangan ({locations.length})
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'transfers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Riwayat Perpindahan ({histories.length})
            </button>
          </div>

          {canMutate && activeTab === 'locations' && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Lokasi</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Master Lokasi Grid */}
      {activeTab === 'locations' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {locations.map((loc) => {
            const itemCount = getItemCountForLoc(loc.id);
            return (
              <div
                key={loc.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-indigo-600" />
                      <span>{loc.name}</span>
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                        loc.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {loc.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {loc.description || 'Ruangan operasional sekolah'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-indigo-700 tabular-nums">
                    {itemCount} Barang Tercatat
                  </span>

                  {canMutate && (
                    <button
                      onClick={() => openEditModal(loc)}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50"
                      title="Edit Lokasi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Riwayat Perpindahan Table */}
      {activeTab === 'transfers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">No</th>
                  <th className="px-3 py-3">Tanggal Mutasi</th>
                  <th className="px-4 py-3">Barang & Kode</th>
                  <th className="px-3 py-3">Ruangan Asal</th>
                  <th className="px-3 py-3">Ruangan Tujuan</th>
                  <th className="px-3 py-3 text-right">Jumlah</th>
                  <th className="px-3 py-3">Petugas Penanggungjawab</th>
                  <th className="px-4 py-3">Alasan / Keterangan</th>
                  <th className="px-3 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {histories.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      Belum ada riwayat perpindahan penempatan barang.
                    </td>
                  </tr>
                ) : (
                  histories.map((hist, idx) => (
                    <tr key={hist.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-3 text-center font-mono text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>

                      <td className="px-3 py-3 font-mono tabular-nums text-slate-700 font-medium">
                        {formatDate(hist.transferDate)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{hist.itemName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{hist.itemCode}</div>
                      </td>

                      <td className="px-3 py-3 text-slate-700 font-medium">
                        {hist.fromLocationName}
                      </td>

                      <td className="px-3 py-3 font-semibold text-indigo-700">
                        {hist.toLocationName}
                      </td>

                      <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {hist.quantityMoved}
                      </td>

                      <td className="px-3 py-3 text-slate-800">
                        {hist.officerName}
                      </td>

                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        {hist.notes || '-'}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {canMutate && (
                            <button
                              onClick={() => openEditHistModal(hist)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                              title="Edit Riwayat Perpindahan"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canMutate && (
                            <button
                              onClick={() => {
                                setRevertLocationOnDelete(false);
                                setHistToDelete(hist);
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus Riwayat Perpindahan"
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
      )}

      {/* Modal Add / Edit Lokasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingLoc ? 'Edit Lokasi / Ruangan' : 'Tambah Lokasi Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Ruangan / Lokasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas 1 / Lab IPA / Aula"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Deskripsi / Fungsi Ruangan
                </label>
                <textarea
                  rows={3}
                  placeholder="Keterangan letak gedung atau fungsi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {editingLoc && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="isActiveCheck" className="font-medium text-slate-700">
                    Status Lokasi Aktif
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Lokasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Riwayat Perpindahan */}
      {isEditHistModalOpen && editingHist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Riwayat Perpindahan Barang
                  </h3>
                  <p className="text-xs text-slate-500">
                    Koreksi catatan mutasi fisik dan lokasi penempatan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditHistModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-900 text-xs sm:text-sm">{editingHist.itemName}</p>
              <p className="text-[11px] font-mono text-slate-500">
                Kode Barang: <span className="font-semibold text-slate-700">{editingHist.itemCode}</span>
              </p>
            </div>

            <form onSubmit={handleSaveEditHist} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Perpindahan / Mutasi *
                  </label>
                  <input
                    type="date"
                    required
                    value={histTransferDate}
                    onChange={(e) => setHistTransferDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah Barang Dipindahkan *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={histQuantityMoved}
                    onChange={(e) => setHistQuantityMoved(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Ruangan Asal *
                  </label>
                  <select
                    value={histFromLocationId}
                    onChange={(e) => setHistFromLocationId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Ruangan Tujuan *
                  </label>
                  <select
                    value={histToLocationId}
                    onChange={(e) => setHistToLocationId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white font-medium text-indigo-700"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Petugas Penanggungjawab Mutasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama pengurus barang / pemindah"
                  value={histOfficerName}
                  onChange={(e) => setHistOfficerName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alasan / Keterangan Perpindahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pemindahan untuk kegiatan praktikum..."
                  value={histNotes}
                  onChange={(e) => setHistNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={histSyncItemLocation}
                    onChange={(e) => setHistSyncItemLocation(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-slate-800 font-medium text-[11px]">
                    Perbarui lokasi fisik barang di data inventaris ke ruangan tujuan baru
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditHistModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingHist}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {savingHist ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Riwayat Perpindahan */}
      <ConfirmDeleteModal
        isOpen={!!histToDelete}
        onClose={() => setHistToDelete(null)}
        onConfirm={handleConfirmDeleteHist}
        title="Hapus Riwayat Perpindahan Barang"
        itemName={histToDelete?.itemName || ''}
        itemCode={histToDelete ? `${histToDelete.itemCode} (Dari: ${histToDelete.fromLocationName} ➔ Ke: ${histToDelete.toLocationName})` : ''}
        message="Apakah Anda yakin ingin menghapus data riwayat perpindahan barang ini? Tindakan ini akan dicatat di audit trail."
        isDeleting={isDeletingHist}
      >
        {histToDelete && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-800">
              <input
                type="checkbox"
                checked={revertLocationOnDelete}
                onChange={(e) => setRevertLocationOnDelete(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <span>
                Kembalikan lokasi saat ini barang di inventaris ke ruangan asal (<strong>{histToDelete.fromLocationName}</strong>)
              </span>
            </label>
          </div>
        )}
      </ConfirmDeleteModal>
    </div>
  );
};
