import React, { useState, useEffect } from 'react';
import { InventoryItem, LocationItem } from '../../types';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { ArrowRightLeft, X } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: InventoryItem | null;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [toLocationId, setToLocationId] = useState('');
  const [quantityMoved, setQuantityMoved] = useState<number>(1);
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    if (item) {
      setQuantityMoved(item.quantity);
      // Select first location that is not current location
      const otherLoc = locations.find((l) => l.id !== item.locationId);
      if (otherLoc) {
        setToLocationId(otherLoc.id);
      }
      setNotes(`Dipindahkan dari ${item.locationName} oleh ${user?.name || 'Petugas'}`);
      setErrorMsg(null);
    }
  }, [item, locations, isOpen]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toLocationId) {
      setErrorMsg('Pilih ruangan / lokasi tujuan.');
      return;
    }
    if (toLocationId === item.locationId) {
      setErrorMsg('Lokasi tujuan tidak boleh sama dengan lokasi saat ini.');
      return;
    }

    const targetLoc = locations.find((l) => l.id === toLocationId);
    if (!targetLoc) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      await api.transferInventoryItem({
        itemId: item.id,
        toLocationId: targetLoc.id,
        toLocationName: targetLoc.name,
        quantityMoved: Number(quantityMoved),
        transferDate,
        notes: notes.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memindahkan barang.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Pindahkan Penempatan Barang
            </h3>
          </div>
          <button
            onClick={onClose}
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
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
            <p className="text-slate-500 font-mono">Kode: {item.itemCode}</p>
            <p className="text-slate-700">
              Lokasi Saat Ini:{' '}
              <span className="font-semibold text-indigo-700">{item.locationName}</span>
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Ruangan / Lokasi Tujuan *
            </label>
            <select
              required
              value={toLocationId}
              onChange={(e) => setToLocationId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {locations
                .filter((l) => l.id !== item.locationId)
                .map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Jumlah Dipindahkan *
              </label>
              <input
                type="number"
                min={1}
                max={item.quantity}
                required
                value={quantityMoved}
                onChange={(e) => setQuantityMoved(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tanggal Perpindahan *
              </label>
              <input
                type="date"
                required
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Alasan / Keterangan Perpindahan
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Contoh: Kebutuhan ujian kelas 6 / penataan ulang ruang guru..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Konfirmasi Pindah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
