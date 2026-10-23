import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { InventoryItem, SchoolSettings } from '../../types';
import { api } from '../../api';
import { generateItemQrData } from '../../utils/formatters';
import { QrCode, Printer, CheckSquare, Square, Search, Filter } from 'lucide-react';

export const LabelPrintView: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [qrMap, setQrMap] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState('');
  const [kibFilter, setKibFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getInventoryItems(), api.getSchoolSettings()]).then(
      async ([itms, sch]) => {
        setItems(itms);
        setSchool(sch);
        // Pre-generate QR for all items
        const map = new Map<string, string>();
        for (const item of itms) {
          try {
            const dataUrl = await QRCode.toDataURL(generateItemQrData(item), {
              width: 140,
              margin: 1,
            });
            map.set(item.id, dataUrl);
          } catch (e) {
            // ignore
          }
        }
        setQrMap(map);
        // Default select all
        setSelectedIds(new Set(itms.map((i) => i.id)));
        setLoading(false);
      }
    );
  }, []);

  const filteredItems = items.filter((item) => {
    if (kibFilter && item.kib !== kibFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term) ||
        item.locationName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handlePrintMass = () => {
    const selectedItems = items.filter((i) => selectedIds.has(i.id));
    if (selectedItems.length === 0) {
      alert('Pilih minimal satu barang untuk dicetak labelnya.');
      return;
    }

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) return;

    const labelCards = selectedItems
      .map((item) => {
        const qrUrl = qrMap.get(item.id) || '';
        return `
          <div class="label-card">
            <div class="school-header">${school?.schoolName || 'UPTD SD NEGERI 01 TELADAN'}</div>
            <div class="label-body">
              <img src="${qrUrl}" class="qr-code-img" />
              <div class="info">
                <div class="code"><strong>Kode:</strong> ${item.itemCode}</div>
                <div class="name">${item.name}</div>
                <div class="reg"><strong>Reg:</strong> ${item.registerNumber || '-'}</div>
                <div class="loc"><strong>Lokasi:</strong> ${item.locationName}</div>
                <div class="year">Thn ${item.year} · ${item.condition}</div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cetak Massal Label Inventaris - ${school?.schoolName || 'SIM-ASET'}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6mm;
          }
          .label-card {
            border: 1.5px solid #000;
            padding: 8px 10px;
            box-sizing: border-box;
            background: #fff;
            page-break-inside: avoid;
            height: 48mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .school-header {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
            text-transform: uppercase;
          }
          .label-body {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
          }
          .qr-code-img {
            width: 70px;
            height: 70px;
            shrink: 0;
          }
          .info {
            font-size: 9.5px;
            line-height: 1.35;
            color: #000;
          }
          .info .name {
            font-weight: bold;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="grid">
          ${labelCards}
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Cetak Massal Label Stiker & QR Code
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pilih inventaris dan cetak lembar stiker QR Code resmi format A4 untuk ditempel pada aset sekolah
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintMass}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak {selectedIds.size} Label Terpilih</span>
          </button>
        </div>
      </div>

      {/* Filter and Selection Tools */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari barang untuk dicetak..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={kibFilter}
            onChange={(e) => setKibFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Semua KIB</option>
            <option value="KIB_B">KIB B (Peralatan)</option>
            <option value="KIB_E">KIB E (Buku)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={selectAll}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
          >
            Pilih Semua
          </button>
          <button
            onClick={deselectAll}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
          >
            Batal Pilih
          </button>
        </div>
      </div>

      {/* Grid of Label Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const qrDataUrl = qrMap.get(item.id);

          return (
            <div
              key={item.id}
              onClick={() => toggleSelect(item.id)}
              className={`cursor-pointer p-4 rounded-xl border transition-all select-none ${
                isSelected
                  ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                <span className="font-mono text-[10px] text-slate-500">{item.itemCode}</span>
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <div className="flex items-center gap-3">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR"
                    className="w-16 h-16 bg-white p-0.5 border border-slate-200 rounded shrink-0"
                  />
                )}
                <div className="text-xs space-y-0.5 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{item.locationName}</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Thn {item.year} · {item.condition}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
