import React, { useState, useEffect } from 'react';
import { ProcurementItem, LocationItem, InventoryKIB, NeedStatus } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { formatRupiah, formatDate, exportToExcel } from '../../utils/formatters';
import {
  ShoppingCart,
  Plus,
  Search,
  Download,
  CheckCircle2,
  PackagePlus,
  Edit2,
  X,
  Truck,
  Building,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const ProcurementView: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  const { canMutate, user } = useAuth();
  const { triggerRefresh } = useRealtime();

  const [procurements, setProcurements] = useState<ProcurementItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Receive and insert into inventory modal state
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedProc, setSelectedProc] = useState<ProcurementItem | null>(null);
  const [receivedQty, setReceivedQty] = useState<number>(1);
  const [targetLocationId, setTargetLocationId] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [specification, setSpecification] = useState('');
  const [unit, setUnit] = useState('Unit');
  const [receiving, setReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState<string | null>(null);

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProcNumber, setNewProcNumber] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newKib, setNewKib] = useState<InventoryKIB>('KIB_B');
  const [newQtyPurchased, setNewQtyPurchased] = useState<number>(1);
  const [newActualPrice, setNewActualPrice] = useState<number>(0);
  const [newFundSource, setNewFundSource] = useState('BOS Reguler 2026');
  const [newSupplier, setNewSupplier] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [savingProc, setSavingProc] = useState(false);

  // Delete modal state
  const [procToDelete, setProcToDelete] = useState<ProcurementItem | null>(null);
  const [isDeletingProc, setIsDeletingProc] = useState(false);

  const handleConfirmDeleteProcurement = async () => {
    if (!procToDelete) return;
    setIsDeletingProc(true);
    try {
      await api.deleteProcurement(procToDelete.id);
      setProcToDelete(null);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete procurement:', err);
    } finally {
      setIsDeletingProc(false);
    }
  };

  const loadData = async () => {
    try {
      const [procs, locs] = await Promise.all([api.getProcurements(), api.getLocations()]);
      setProcurements(procs);
      setLocations(locs);
      if (locs.length > 0 && !targetLocationId) {
        setTargetLocationId(locs[0].id);
      }
    } catch (err) {
      console.error('Error loading procurement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [triggerRefresh]);

  const filteredProcurements = procurements.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      const match =
        p.itemName.toLowerCase().includes(term) ||
        p.procurementNumber.toLowerCase().includes(term) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(term)) ||
        (p.needCode && p.needCode.toLowerCase().includes(term));
      if (!match) return false;
    }
    return true;
  });

  const totalValue = filteredProcurements.reduce((acc, p) => acc + (Number(p.totalProcurementValue) || 0), 0);

  const openReceiveModal = (proc: ProcurementItem) => {
    setSelectedProc(proc);
    const unreceived = Math.max(1, proc.quantityPurchased - (proc.quantityReceived || 0));
    setReceivedQty(unreceived);
    setTargetLocationId(locations[0]?.id || 'loc-tu');
    const prefix = proc.kib === 'KIB_B' ? '02.06.01' : '05.17.01';
    setItemCode(`${prefix}.${Math.floor(1000 + Math.random() * 9000)}`);
    setRegisterNumber(`REG-${new Date().getFullYear()}-${proc.kib === 'KIB_B' ? 'B' : 'E'}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBrandModel('');
    setSpecification('');
    setUnit(proc.kib === 'KIB_B' ? 'Unit' : 'Eksemplar');
    setReceiveError(null);
    setIsReceiveModalOpen(true);
  };

  const handleExecuteReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProc) return;

    const loc = locations.find((l) => l.id === targetLocationId);
    const locationName = loc ? loc.name : 'Ruang Tata Usaha';

    setReceiving(true);
    setReceiveError(null);

    try {
      await api.receiveProcurementToInventory(selectedProc.id, {
        receivedQuantity: Number(receivedQty),
        locationId: targetLocationId,
        locationName,
        itemCode: itemCode.trim(),
        registerNumber: registerNumber.trim(),
        brandModel: brandModel.trim() || undefined,
        specification: specification.trim() || undefined,
        unit,
      });

      setIsReceiveModalOpen(false);
      loadData();
      alert(`Berhasil! Barang "${selectedProc.itemName}" sebanyak ${receivedQty} ${unit} telah diverifikasi dan masuk ke inventaris (${selectedProc.kib}) di ${locationName}.`);
      if (onNavigate) {
        onNavigate(selectedProc.kib === 'KIB_B' ? 'kibb' : 'kibe');
      }
    } catch (err: any) {
      setReceiveError(err.message || 'Gagal memasukkan barang ke inventaris.');
    } finally {
      setReceiving(false);
    }
  };

  const handleCreateManualProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setSavingProc(true);
    try {
      await api.createProcurement({
        procurementNumber: newProcNumber || `PGD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        itemName: newItemName.trim(),
        kib: newKib,
        quantityProposed: Number(newQtyPurchased),
        quantityApproved: Number(newQtyPurchased),
        quantityPurchased: Number(newQtyPurchased),
        quantityReceived: 0,
        actualUnitPrice: Number(newActualPrice),
        totalProcurementValue: Number(newQtyPurchased) * Number(newActualPrice),
        fundSource: newFundSource,
        submissionDate: new Date().toISOString().split('T')[0],
        supplierName: newSupplier.trim() || undefined,
        officerName: user?.name || 'Petugas Pengadaan',
        status: 'Dalam Proses Pengadaan',
        notes: newNotes.trim() || undefined,
      });

      setIsAddModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Gagal membuat pengadaan: ' + err.message);
    } finally {
      setSavingProc(false);
    }
  };

  const handleExportExcel = () => {
    const data = filteredProcurements.map((p, idx) => ({
      'No': idx + 1,
      'No Pengadaan': p.procurementNumber,
      'Nama Barang': p.itemName,
      'KIB': p.kib === 'KIB_B' ? 'KIB B' : 'KIB E',
      'Diajukan': p.quantityProposed,
      'Dibeli': p.quantityPurchased,
      'Diterima': p.quantityReceived,
      'Harga Satuan': p.actualUnitPrice,
      'Nilai Pengadaan': p.totalProcurementValue,
      'Sumber Dana': p.fundSource,
      'Penyedia': p.supplierName || '-',
      'Tanggal Pengajuan': p.submissionDate,
      'Status': p.status,
    }));
    exportToExcel(data, `Rekap_Pengadaan_Barang_${new Date().getFullYear()}`, 'Pengadaan');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Pengadaan Barang & Penerimaan ke Inventaris
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span>Alur: Kebutuhan → Pengadaan → Diterima → Masuk Inventaris</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{filteredProcurements.length} Paket</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-bold text-slate-900">{formatRupiah(totalValue)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canMutate && (
            <button
              onClick={() => {
                setNewProcNumber(`PGD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
                setNewItemName('');
                setNewQtyPurchased(1);
                setNewActualPrice(0);
                setNewSupplier('PT. SIPLah Rekanan Sekolah');
                setNewNotes('');
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Paket Pengadaan</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nomor pengadaan, nama barang, penyedia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Status Pengadaan</option>
              <option value="Dalam Proses Pengadaan">Dalam Proses Pengadaan</option>
              <option value="Sudah Diterima">Sudah Diterima</option>
              <option value="Selesai">Selesai</option>
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
                <th className="px-3 py-3">No. Pengadaan & Tanggal</th>
                <th className="px-4 py-3">Nama Barang / Buku</th>
                <th className="px-3 py-3">Penyedia / Toko</th>
                <th className="px-3 py-3 text-right">Dibeli</th>
                <th className="px-3 py-3 text-right">Diterima</th>
                <th className="px-3 py-3 text-right">Nilai Total</th>
                <th className="px-3 py-3">Sumber Dana</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-center w-36">Aksi Masuk Inventaris</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Memuat data pengadaan...
                  </td>
                </tr>
              ) : filteredProcurements.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Belum ada data pengadaan.
                  </td>
                </tr>
              ) : (
                filteredProcurements.map((proc, idx) => {
                  const isFullyReceived = proc.quantityReceived >= proc.quantityPurchased;
                  return (
                    <tr key={proc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3 py-3 text-center font-mono text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>

                      <td className="px-3 py-3 font-mono">
                        <div className="font-semibold text-slate-900">{proc.procurementNumber}</div>
                        <div className="text-[10px] text-slate-500">{formatDate(proc.submissionDate)}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{proc.itemName}</div>
                        <div className="text-[11px] text-slate-500">
                          {proc.kib === 'KIB_B' ? 'KIB B (Peralatan)' : 'KIB E (Buku)'}
                          {proc.needCode && ` · Ref: ${proc.needCode}`}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-slate-700">
                        {proc.supplierName || 'Penyedia Resmi SIPLah'}
                      </td>

                      <td className="px-3 py-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                        {proc.quantityPurchased}
                      </td>

                      <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-emerald-700">
                        {proc.quantityReceived || 0}
                      </td>

                      <td className="px-3 py-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatRupiah(proc.totalProcurementValue)}
                      </td>

                      <td className="px-3 py-3 text-slate-600 text-[11px]">{proc.fundSource}</td>

                      <td className="px-3 py-3">
                        <span
                          className={`text-[11px] font-semibold ${
                            isFullyReceived ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {proc.status}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isFullyReceived ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Di Inventaris</span>
                            </span>
                          ) : canMutate ? (
                            <button
                              onClick={() => openReceiveModal(proc)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                              title="Terima Barang ke Inventaris"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                              <span>Terima</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">Menunggu Penerimaan</span>
                          )}

                          {canMutate && (
                            <button
                              onClick={() => setProcToDelete(proc)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus Data Pengadaan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Penerimaan Barang ke Inventaris (Integrasi Otomatis) */}
      {isReceiveModalOpen && selectedProc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Masukkan Barang Pengadaan ke Inventaris
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedProc.procurementNumber} · {selectedProc.kib === 'KIB_B' ? 'KIB B' : 'KIB E'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {receiveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {receiveError}
              </div>
            )}

            <form onSubmit={handleExecuteReceive} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="font-bold text-slate-900 text-sm">{selectedProc.itemName}</p>
                <div className="flex justify-between text-slate-600">
                  <span>Jumlah Dibeli: {selectedProc.quantityPurchased}</span>
                  <span>Sudah Diterima Sebelumnya: {selectedProc.quantityReceived || 0}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Jumlah Diterima Saat Ini *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedProc.quantityPurchased - (selectedProc.quantityReceived || 0)}
                    required
                    value={receivedQty}
                    onChange={(e) => setReceivedQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Satuan *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Lokasi Penempatan Ruangan Fisik *
                </label>
                <select
                  required
                  value={targetLocationId}
                  onChange={(e) => setTargetLocationId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kode Barang Baru *</label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nomor Register *</label>
                  <input
                    type="text"
                    required
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {selectedProc.kib === 'KIB_B' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Merk / Tipe</label>
                    <input
                      type="text"
                      placeholder="Merk barang"
                      value={brandModel}
                      onChange={(e) => setBrandModel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Spesifikasi</label>
                    <input
                      type="text"
                      placeholder="Spesifikasi teknis"
                      value={specification}
                      onChange={(e) => setSpecification(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-[11px] text-indigo-900 space-y-1">
                <p className="font-semibold">Otomasi Integrasi Database:</p>
                <p>• Data otomatis dimasukkan ke tabel {selectedProc.kib === 'KIB_B' ? 'KIB B' : 'KIB E'}.</p>
                <p>• Kekurangan kebutuhan terkait otomatis dikurangi & QR Code siap dicetak.</p>
                <p>• Transaksi ini aman dan terlindungi dari klik ganda.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={receiving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {receiving ? 'Menyimpan ke Inventaris...' : 'Konfirmasi Masuk Inventaris'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Paket Pengadaan Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">
                Tambah Paket Pengadaan Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualProcurement} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nomor Pengadaan *</label>
                <input
                  type="text"
                  required
                  value={newProcNumber}
                  onChange={(e) => setNewProcNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Nama Barang / Buku *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Meja Siswa / Laptop"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jenis KIB *</label>
                  <select
                    value={newKib}
                    onChange={(e) => setNewKib(e.target.value as InventoryKIB)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="KIB_B">KIB B (Peralatan & Mesin)</option>
                    <option value="KIB_E">KIB E (Buku)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Jumlah Dibeli *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newQtyPurchased}
                    onChange={(e) => setNewQtyPurchased(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Harga Satuan Aktual (Rp) *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newActualPrice}
                    onChange={(e) => setNewActualPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Penyedia / Toko SIPLah</label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sumber Dana</label>
                  <input
                    type="text"
                    value={newFundSource}
                    onChange={(e) => setNewFundSource(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan / Kontrak</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingProc}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
                >
                  {savingProc ? 'Menyimpan...' : 'Simpan Pengadaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Pengadaan */}
      <ConfirmDeleteModal
        isOpen={!!procToDelete}
        onClose={() => setProcToDelete(null)}
        onConfirm={handleConfirmDeleteProcurement}
        title="Hapus Data Pengadaan"
        itemName={procToDelete?.itemName || ''}
        itemCode={procToDelete?.procurementNumber}
        message="Apakah Anda yakin ingin menghapus paket pengadaan barang ini? Tindakan ini akan dicatat di audit log dan tidak dapat dibatalkan."
        isDeleting={isDeletingProc}
      />
    </div>
  );
};
