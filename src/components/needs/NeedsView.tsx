import React, { useState, useEffect } from 'react';
import { NeedItem, NeedPriority, NeedStatus, InventoryKIB, LocationItem } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatRupiah, exportToExcel } from '../../utils/formatters';
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  AlertTriangle,
  ArrowRight,
  ShoppingCart,
  Trash2,
  Edit2,
  X,
  Coins,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const NeedsView: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { canMutate } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kibFilter, setKibFilter] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState<NeedItem | null>(null);

  // Form State
  const [kib, setKib] = useState<InventoryKIB>('KIB_B');
  const [name, setName] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [specification, setSpecification] = useState('');
  const [quantityNeeded, setQuantityNeeded] = useState<number>(1);
  const [unit, setUnit] = useState('Unit');
  const [estimatedUnitPrice, setEstimatedUnitPrice] = useState<number>(0);
  const [priority, setPriority] = useState<NeedPriority>('Mendesak');
  const [locationId, setLocationId] = useState('');
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const [plannedFundSource, setPlannedFundSource] = useState('BOS Reguler 2026');
  const [status, setStatus] = useState<NeedStatus>('Pengajuan');
  const [notes, setNotes] = useState('');

  // KIB E fields
  const [subject, setSubject] = useState('');
  const [gradeClass, setGradeClass] = useState('Kelas 1');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Delete modal state
  const [needToDelete, setNeedToDelete] = useState<NeedItem | null>(null);
  const [isDeletingNeed, setIsDeletingNeed] = useState(false);

  const loadData = async () => {
    try {
      const [nds, locs] = await Promise.all([api.getNeeds(), api.getLocations()]);
      setNeeds(nds);
      setLocations(locs);
      if (locs.length > 0 && !locationId) {
        setLocationId(locs[0].id);
      }
    } catch (err) {
      console.error('Error loading needs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  const filteredNeeds = needs.filter((n) => {
    if (kibFilter && n.kib !== kibFilter) return false;
    if (priorityFilter && n.priority !== priorityFilter) return false;
    if (statusFilter && n.status !== statusFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const match =
        n.name.toLowerCase().includes(term) ||
        n.needCode.toLowerCase().includes(term) ||
        (n.brandModel && n.brandModel.toLowerCase().includes(term)) ||
        n.locationName.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  const totalShortage = filteredNeeds.reduce((acc, n) => acc + (Number(n.quantityShortage) || 0), 0);
  const totalBudget = filteredNeeds.reduce((acc, n) => acc + (Number(n.estimatedTotalBudget) || 0), 0);

  const openAddModal = () => {
    setEditingNeed(null);
    setKib('KIB_B');
    setName('');
    setBrandModel('');
    setSpecification('');
    setQuantityNeeded(1);
    setUnit('Unit');
    setEstimatedUnitPrice(0);
    setPriority('Mendesak');
    setLocationId(locations[0]?.id || 'loc-tu');
    setTargetYear(new Date().getFullYear());
    setPlannedFundSource('BOS Reguler 2026');
    setStatus('Pengajuan');
    setNotes('');
    setSubject('');
    setGradeClass('Kelas 1');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (need: NeedItem) => {
    setEditingNeed(need);
    setKib(need.kib);
    setName(need.name);
    setBrandModel(need.brandModel || '');
    setSpecification(need.specification || '');
    setQuantityNeeded(need.quantityNeeded);
    setUnit(need.unit);
    setEstimatedUnitPrice(need.estimatedUnitPrice);
    setPriority(need.priority);
    setLocationId(need.locationId);
    setTargetYear(need.targetYear);
    setPlannedFundSource(need.plannedFundSource);
    setStatus(need.status);
    setNotes(need.notes || '');
    setSubject(need.subject || '');
    setGradeClass(need.gradeClass || 'Kelas 1');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama barang / judul buku wajib diisi.');
      return;
    }

    const loc = locations.find((l) => l.id === locationId);
    const locationName = loc ? loc.name : 'Ruang Tata Usaha';

    setSaving(true);
    setErrorMsg(null);

    const payload: Partial<NeedItem> = {
      needCode: editingNeed ? editingNeed.needCode : `KBT-${new Date().getFullYear()}-${kib === 'KIB_B' ? 'B' : 'E'}-${Math.floor(100 + Math.random() * 900)}`,
      kib,
      name: name.trim(),
      brandModel: brandModel.trim() || undefined,
      specification: specification.trim() || undefined,
      quantityNeeded: Number(quantityNeeded),
      unit: unit.trim() || 'Unit',
      estimatedUnitPrice: Number(estimatedUnitPrice),
      priority,
      locationId,
      locationName,
      targetYear: Number(targetYear),
      plannedFundSource,
      status,
      notes: notes.trim() || undefined,
      subject: kib === 'KIB_E' ? subject.trim() : undefined,
      gradeClass: kib === 'KIB_E' ? gradeClass : undefined,
    };

    try {
      if (editingNeed) {
        await api.updateNeed(editingNeed.id, payload);
      } else {
        await api.createNeed(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan usulan kebutuhan.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteNeed = async () => {
    if (!needToDelete) return;
    setIsDeletingNeed(true);
    try {
      await api.deleteNeed(needToDelete.id);
      setNeedToDelete(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete need:', err);
    } finally {
      setIsDeletingNeed(false);
    }
  };

  // One-click conversion to Procurement proposal
  const handleProceedToProcurement = async (need: NeedItem) => {
    if (need.quantityShortage <= 0) {
      alert('Kekurangan barang ini sudah 0 (sudah terpenuhi di inventaris).');
      return;
    }

    if (window.confirm(`Lanjutkan "${need.name}" ke Pengadaan Barang?\nJumlah yang diajukan: ${need.quantityShortage} ${need.unit}\nTotal Anggaran: ${formatRupiah(need.estimatedTotalBudget)}`)) {
      try {
        await api.createProcurement({
          procurementNumber: `PGD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          needId: need.id,
          needCode: need.needCode,
          itemName: need.name,
          kib: need.kib,
          quantityProposed: need.quantityShortage,
          quantityApproved: need.quantityShortage,
          quantityPurchased: need.quantityShortage,
          quantityReceived: 0,
          actualUnitPrice: need.estimatedUnitPrice,
          totalProcurementValue: need.estimatedTotalBudget,
          fundSource: need.plannedFundSource,
          submissionDate: new Date().toISOString().split('T')[0],
          officerName: 'Siti Rahmawati, S.Pd',
          status: 'Dalam Proses Pengadaan',
          notes: `Diusulkan dari kebutuhan ${need.needCode}`,
        });

        // Update need status to 'Dalam Proses Pengadaan'
        await api.updateNeed(need.id, { status: 'Dalam Proses Pengadaan' });
        loadData();
        if (onNavigate) {
          onNavigate('procurement');
        }
      } catch (err: any) {
        alert('Gagal membuat pengadaan: ' + err.message);
      }
    }
  };

  const handleExportExcel = () => {
    const data = filteredNeeds.map((n, idx) => ({
      'No': idx + 1,
      'Kode Kebutuhan': n.needCode,
      'KIB': n.kib === 'KIB_B' ? 'KIB B' : 'KIB E',
      'Nama Barang': n.name,
      'Dibutuhkan': n.quantityNeeded,
      'Tersedia': n.quantityAvailable,
      'Kekurangan': n.quantityShortage,
      'Satuan': n.unit,
      'Harga Satuan': n.estimatedUnitPrice,
      'Total Anggaran': n.estimatedTotalBudget,
      'Prioritas': n.priority,
      'Lokasi': n.locationName,
      'Tahun': n.targetYear,
      'Sumber Dana': n.plannedFundSource,
      'Status': n.status,
    }));
    exportToExcel(data, `Laporan_Kebutuhan_Barang_${new Date().getFullYear()}`, 'Kebutuhan');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Kebutuhan Barang & Perhitungan Kekurangan Otomatis
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Kekurangan = Max(0, Dibutuhkan - Tersedia)</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-amber-700 font-semibold">
              Total Kekurangan: {totalShortage} Fisik
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-emerald-700">{formatRupiah(totalBudget)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canMutate && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Usul Kebutuhan Baru</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari kebutuhan, kode, nama barang, lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={kibFilter}
              onChange={(e) => setKibFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="">Semua KIB</option>
              <option value="KIB_B">KIB B (Peralatan)</option>
              <option value="KIB_E">KIB E (Buku)</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Prioritas</option>
              <option value="Sangat Mendesak">Sangat Mendesak</option>
              <option value="Mendesak">Mendesak</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Status</option>
              <option value="Pengajuan">Pengajuan</option>
              <option value="Dalam Proses Pengadaan">Dalam Proses Pengadaan</option>
              <option value="Sudah Diterima">Sudah Diterima</option>
              <option value="Selesai">Selesai (Terpenuhi)</option>
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
                <th className="px-3 py-3">Kode Kebutuhan</th>
                <th className="px-4 py-3">Nama Barang / Buku</th>
                <th className="px-3 py-3 text-right">Dibutuhkan</th>
                <th className="px-3 py-3 text-right">Tersedia</th>
                <th className="px-3 py-3 text-right">Kekurangan</th>
                <th className="px-3 py-3 text-right">Estimasi Anggaran</th>
                <th className="px-3 py-3">Prioritas</th>
                <th className="px-3 py-3">Lokasi</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Memuat data kebutuhan...
                  </td>
                </tr>
              ) : filteredNeeds.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    Tidak ada data kebutuhan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredNeeds.map((need, idx) => (
                  <tr key={need.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-3 py-3 text-center font-mono text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>

                    <td className="px-3 py-3 font-mono font-semibold text-slate-900">
                      {need.needCode}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{need.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {need.brandModel || need.specification || ''}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums text-slate-700">
                      {need.quantityNeeded} {need.unit}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums text-emerald-600 font-semibold">
                      {need.quantityAvailable}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-amber-600">
                      {need.quantityShortage}
                    </td>

                    <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                      {formatRupiah(need.estimatedTotalBudget)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] font-semibold ${
                          need.priority === 'Sangat Mendesak'
                            ? 'text-red-700'
                            : need.priority === 'Mendesak'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {need.priority}
                      </span>
                    </td>

                    <td className="px-3 py-3 font-medium text-slate-700">{need.locationName}</td>

                    <td className="px-3 py-3">
                      <span className="text-[11px] font-medium text-slate-800">{need.status}</span>
                    </td>

                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canMutate && need.quantityShortage > 0 && need.status !== 'Selesai' && (
                          <button
                            onClick={() => handleProceedToProcurement(need)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-medium"
                            title="Lanjutkan ke Pengadaan"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            <span>Pengadaan</span>
                          </button>
                        )}

                        {canMutate && (
                          <button
                            onClick={() => openEditModal(need)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {canMutate && (
                          <button
                            onClick={() => setNeedToDelete(need)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus Usulan"
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

      {/* Modal Add/Edit Kebutuhan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                {editingNeed ? 'Edit Usulan Kebutuhan' : 'Usulkan Kebutuhan Barang Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setKib('KIB_B');
                    setUnit('Unit');
                  }}
                  className={`py-2 text-center font-semibold rounded-lg ${
                    kib === 'KIB_B' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Kebutuhan KIB B (Peralatan & Mesin)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKib('KIB_E');
                    setUnit('Eksemplar');
                  }}
                  className={`py-2 text-center font-semibold rounded-lg ${
                    kib === 'KIB_E' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Kebutuhan KIB E (Buku)
                </button>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Barang / Judul Buku *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Laptop Lenovo / Printer Epson L3210 / Buku Bahasa Indonesia"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {kib === 'KIB_B' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Merk / Tipe</label>
                    <input
                      type="text"
                      placeholder="Contoh: ThinkPad E14 Gen 4"
                      value={brandModel}
                      onChange={(e) => setBrandModel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Spesifikasi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Core i5, 16GB RAM"
                      value={specification}
                      onChange={(e) => setSpecification(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                    <input
                      type="text"
                      placeholder="Bahasa Indonesia"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Tingkat Kelas</label>
                    <select
                      value={gradeClass}
                      onChange={(e) => setGradeClass(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Kelas 1">Kelas 1</option>
                      <option value="Kelas 2">Kelas 2</option>
                      <option value="Kelas 3">Kelas 3</option>
                      <option value="Kelas 4">Kelas 4</option>
                      <option value="Kelas 5">Kelas 5</option>
                      <option value="Kelas 6">Kelas 6</option>
                      <option value="Umum / SD">Umum / Perpustakaan</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jumlah Dibutuhkan *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Perkiraan Harga Satuan *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={estimatedUnitPrice}
                    onChange={(e) => setEstimatedUnitPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tingkat Prioritas</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NeedPriority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Sangat Mendesak">Sangat Mendesak</option>
                    <option value="Mendesak">Mendesak</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Lokasi Membutuhkan *</label>
                  <select
                    required
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Rencana Sumber Dana</label>
                  <input
                    type="text"
                    value={plannedFundSource}
                    onChange={(e) => setPlannedFundSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Kebutuhan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan urgensi atau peruntukan penggunaan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
                  {saving ? 'Menyimpan...' : editingNeed ? 'Simpan Perubahan' : 'Simpan Usulan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Usulan Kebutuhan */}
      <ConfirmDeleteModal
        isOpen={!!needToDelete}
        onClose={() => setNeedToDelete(null)}
        onConfirm={handleConfirmDeleteNeed}
        title="Hapus Usulan Kebutuhan"
        itemName={needToDelete?.name || ''}
        itemCode={needToDelete?.needCode}
        message="Apakah Anda yakin ingin menghapus data usulan kebutuhan ini? Tindakan ini akan dicatat di audit trail."
        isDeleting={isDeletingNeed}
      />
    </div>
  );
};
