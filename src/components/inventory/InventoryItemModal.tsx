import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryKIB, ItemCondition, LocationItem } from '../../types';
import { api } from '../../api';
import { formatRupiah } from '../../utils/formatters';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  itemToEdit?: InventoryItem | null;
  defaultKib?: InventoryKIB;
}

export const InventoryItemModal: React.FC<InventoryItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  itemToEdit,
  defaultKib = 'KIB_B',
}) => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [kib, setKib] = useState<InventoryKIB>(defaultKib);
  const [itemCode, setItemCode] = useState('');
  const [name, setName] = useState('');
  const [brandModel, setBrandModel] = useState('');
  const [specification, setSpecification] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('Unit');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [fundSource, setFundSource] = useState('BOS Reguler');
  const [condition, setCondition] = useState<ItemCondition>('Baik');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  // KIB E specific fields
  const [subject, setSubject] = useState('');
  const [gradeClass, setGradeClass] = useState('Kelas 1');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [isbn, setIsbn] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getLocations().then(setLocations).catch(console.error);
  }, []);

  useEffect(() => {
    if (itemToEdit) {
      setKib(itemToEdit.kib);
      setItemCode(itemToEdit.itemCode);
      setName(itemToEdit.name);
      setBrandModel(itemToEdit.brandModel || '');
      setSpecification(itemToEdit.specification || '');
      setRegisterNumber(itemToEdit.registerNumber || '');
      setYear(itemToEdit.year);
      setQuantity(itemToEdit.quantity);
      setUnit(itemToEdit.unit);
      setUnitPrice(itemToEdit.unitPrice);
      setFundSource(itemToEdit.fundSource);
      setCondition(itemToEdit.condition);
      setLocationId(itemToEdit.locationId);
      setNotes(itemToEdit.notes || '');
      setPhotoUrl(itemToEdit.photoUrl);

      setSubject(itemToEdit.subject || '');
      setGradeClass(itemToEdit.gradeClass || 'Kelas 1');
      setAuthor(itemToEdit.author || '');
      setPublisher(itemToEdit.publisher || '');
      setIsbn(itemToEdit.isbn || '');
    } else {
      setKib(defaultKib);
      const prefix = defaultKib === 'KIB_B' ? '02.06.01' : '05.17.01';
      setItemCode(`${prefix}.${Math.floor(1000 + Math.random() * 9000)}`);
      setName('');
      setBrandModel('');
      setSpecification('');
      setRegisterNumber(`REG-${new Date().getFullYear()}-${defaultKib === 'KIB_B' ? 'B' : 'E'}-${Math.floor(1000 + Math.random() * 9000)}`);
      setYear(new Date().getFullYear());
      setQuantity(1);
      setUnit(defaultKib === 'KIB_B' ? 'Unit' : 'Eksemplar');
      setUnitPrice(0);
      setFundSource('BOS Reguler');
      setCondition('Baik');
      setLocationId(locations[0]?.id || 'loc-tu');
      setNotes('');
      setPhotoUrl(undefined);
      setSubject('');
      setGradeClass('Kelas 1');
      setAuthor('');
      setPublisher('');
      setIsbn('');
    }
    setErrorMsg(null);
  }, [itemToEdit, defaultKib, isOpen]);

  if (!isOpen) return null;

  const totalValue = quantity * unitPrice;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama barang / judul buku wajib diisi.');
      return;
    }
    if (!locationId) {
      setErrorMsg('Lokasi penempatan wajib dipilih.');
      return;
    }

    const loc = locations.find((l) => l.id === locationId);
    const locationName = loc ? loc.name : 'Ruang Tata Usaha';

    setSaving(true);
    setErrorMsg(null);

    const payload: Partial<InventoryItem> = {
      kib,
      itemCode: itemCode.trim(),
      name: name.trim(),
      brandModel: brandModel.trim() || undefined,
      specification: specification.trim() || undefined,
      registerNumber: registerNumber.trim() || undefined,
      year: Number(year),
      quantity: Number(quantity),
      unit: unit.trim() || 'Unit',
      unitPrice: Number(unitPrice),
      totalValue,
      fundSource,
      condition,
      locationId,
      locationName,
      notes: notes.trim() || undefined,
      photoUrl,
      subject: kib === 'KIB_E' ? subject.trim() : undefined,
      gradeClass: kib === 'KIB_E' ? gradeClass : undefined,
      author: kib === 'KIB_E' ? author.trim() : undefined,
      publisher: kib === 'KIB_E' ? publisher.trim() : undefined,
      isbn: kib === 'KIB_E' ? isbn.trim() : undefined,
    };

    try {
      if (itemToEdit) {
        await api.updateInventoryItem(itemToEdit.id, {
          ...payload,
          version: itemToEdit.version,
        });
      } else {
        await api.createInventoryItem(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan inventaris.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {itemToEdit ? 'Edit Data Inventaris' : 'Tambah Inventaris Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              {kib === 'KIB_B' ? 'KIB B — Peralatan dan Mesin' : 'KIB E — Buku'}
            </p>
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
          {/* KIB Selector if adding new */}
          {!itemToEdit && (
            <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setKib('KIB_B');
                  setUnit('Unit');
                }}
                className={`py-2 text-center font-semibold rounded-lg transition-colors ${
                  kib === 'KIB_B' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                KIB B — Peralatan & Mesin
              </button>
              <button
                type="button"
                onClick={() => {
                  setKib('KIB_E');
                  setUnit('Eksemplar');
                }}
                className={`py-2 text-center font-semibold rounded-lg transition-colors ${
                  kib === 'KIB_E' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                KIB E — Buku
              </button>
            </div>
          )}

          {/* Core Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kode Barang / Buku *</label>
              <input
                type="text"
                required
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nomor Register</label>
              <input
                type="text"
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tahun Perolehan / Terbit *</label>
              <input
                type="number"
                required
                min={1990}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Name & Specific Fields */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {kib === 'KIB_B' ? 'Nama Barang *' : 'Judul Buku *'}
            </label>
            <input
              type="text"
              required
              placeholder={kib === 'KIB_B' ? 'Contoh: Printer Epson L3210' : 'Contoh: Buku Bahasa Indonesia Kelas 1'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {kib === 'KIB_B' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Merk / Tipe</label>
                <input
                  type="text"
                  placeholder="Contoh: Epson EcoTank L3210"
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Spesifikasi Teknis</label>
                <input
                  type="text"
                  placeholder="Contoh: All-in-One InkTank USB 2.0"
                  value={specification}
                  onChange={(e) => setSpecification(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                <input
                  type="text"
                  placeholder="Contoh: Bahasa Indonesia"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kelas</label>
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
                  <option value="Umum / SD">Umum / SD</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Pengarang</label>
                <input
                  type="text"
                  placeholder="Nama Pengarang"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Penerbit & ISBN</label>
                <input
                  type="text"
                  placeholder="Penerbit / ISBN"
                  value={publisher || isbn}
                  onChange={(e) => {
                    setPublisher(e.target.value);
                    setIsbn(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Quantity, Unit, Price, and Auto-Total */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Jumlah Fisik *</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
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
              <label className="block font-medium text-slate-700 mb-1">Harga Satuan (Rp) *</label>
              <input
                type="number"
                min={0}
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nilai Total Otomatis</label>
              <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg font-mono font-bold text-indigo-900 tabular-nums">
                {formatRupiah(totalValue)}
              </div>
            </div>
          </div>

          {/* Location, Condition, Fund Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Lokasi Penempatan *</label>
              <select
                required
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kondisi Barang *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sumber Dana *</label>
              <select
                value={fundSource}
                onChange={(e) => setFundSource(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="BOS Reguler">BOS Reguler</option>
                <option value="BOS Kinerja">BOS Kinerja</option>
                <option value="BOP Daerah">BOP Daerah</option>
                <option value="Komite Sekolah">Komite Sekolah</option>
                <option value="Hibah / Bantuan">Hibah / Bantuan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {/* Photo & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Foto Fisik Barang / Buku</label>
              <div className="flex items-center gap-3">
                {photoUrl ? (
                  <div className="relative w-20 h-20 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrl(undefined)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[9px]">Belum ada</span>
                  </div>
                )}
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-medium">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, atau JPEG maks 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Keterangan Tambahan</label>
              <textarea
                rows={3}
                placeholder="Catatan penempatan, nomor seri, atau kondisi khusus..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs transition-colors"
            >
              {saving ? 'Menyimpan...' : itemToEdit ? 'Simpan Perubahan' : 'Tambah ke Inventaris'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
