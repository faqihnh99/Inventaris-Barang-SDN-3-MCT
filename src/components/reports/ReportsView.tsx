import React, { useState, useEffect } from 'react';
import {
  InventoryItem,
  NeedItem,
  ProcurementItem,
  LocationHistory,
  SchoolSettings,
  LetterheadSettings,
  StaffSettings,
  LocationItem,
} from '../../types';
import { api } from '../../api';
import { formatRupiah, formatDate, exportToExcel, exportToWord } from '../../utils/formatters';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
  Calendar,
  Filter,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [reportType, setReportType] = useState<string>('all_inventory');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [needs, setNeeds] = useState<NeedItem[]>([]);
  const [procurements, setProcurements] = useState<ProcurementItem[]>([]);
  const [histories, setHistories] = useState<LocationHistory[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  const [school, setSchool] = useState<SchoolSettings | null>(null);
  const [letterhead, setLetterhead] = useState<LetterheadSettings | null>(null);
  const [staff, setStaff] = useState<StaffSettings | null>(null);

  // Filters
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInventoryItems(),
      api.getNeeds(),
      api.getProcurements(),
      api.getLocationHistories(),
      api.getLocations(),
      api.getSchoolSettings(),
      api.getLetterheadSettings(),
      api.getStaffSettings(),
    ])
      .then(([itms, nds, procs, hists, locs, sch, lth, stf]) => {
        setInventoryItems(itms);
        setNeeds(nds);
        setProcurements(procs);
        setHistories(hists);
        setLocations(locs);
        setSchool(sch);
        setLetterhead(lth);
        setStaff(stf);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const reportOptions = [
    { id: 'all_inventory', label: '1. Semua Inventaris Sekolah' },
    { id: 'kib_b', label: '2. KIB B — Peralatan dan Mesin' },
    { id: 'kib_e', label: '3. KIB E — Buku' },
    { id: 'inv_location', label: '4. Inventaris Berdasarkan Lokasi Ruangan' },
    { id: 'inv_condition', label: '5. Inventaris Berdasarkan Kondisi' },
    { id: 'inv_year', label: '6. Inventaris Berdasarkan Tahun Perolehan' },
    { id: 'inv_funds', label: '7. Inventaris Berdasarkan Sumber Dana' },
    { id: 'damaged_items', label: '8. Rekap Barang Rusak (Ringan / Berat)' },
    { id: 'asset_value', label: '9. Rekapitulasi Nilai Aset Sekolah' },
    { id: 'item_quantity', label: '10. Rekap Jumlah Barang Fisik' },
    { id: 'all_needs', label: '11. Semua Kebutuhan Barang Inventaris' },
    { id: 'needs_kib_b', label: '12. Kebutuhan KIB B (Peralatan & Mesin)' },
    { id: 'needs_kib_e', label: '13. Kebutuhan KIB E (Buku)' },
    { id: 'needs_location', label: '14. Kebutuhan Berdasarkan Ruangan' },
    { id: 'needs_year', label: '15. Kebutuhan Berdasarkan Tahun' },
    { id: 'needs_urgent', label: '16. Kebutuhan Sangat Mendesak' },
    { id: 'needs_unfulfilled', label: '17. Kebutuhan Belum Terpenuhi (Kekurangan > 0)' },
    { id: 'needs_fulfilled', label: '18. Kebutuhan Selesai / Terpenuhi' },
    { id: 'procurement_status', label: '19. Rekap Status Pengadaan Barang' },
    { id: 'budget_summary', label: '20. Rekap Estimasi Anggaran Pengadaan' },
    { id: 'procurement_all', label: '21. Rekapitulasi Pengadaan Barang' },
    { id: 'transfers_all', label: '22. Riwayat Mutasi & Perpindahan Barang' },
  ];

  // Helper to get active dataset based on report type and filters
  const getActiveReportData = () => {
    let title = 'LAPORAN INVENTARIS SEKOLAH';
    let rows: any[] = [];
    let columns: { header: string; key: string; align?: 'left' | 'center' | 'right'; isCurrency?: boolean }[] = [];

    switch (reportType) {
      case 'kib_b':
        title = 'LAPORAN KIB B (KARTU INVENTARIS BARANG — PERALATAN DAN MESIN)';
        rows = inventoryItems.filter((i) => i.kib === 'KIB_B');
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'Kode Barang', key: 'itemCode' },
          { header: 'Nama Barang / Merk / Tipe', key: 'name' },
          { header: 'No. Register', key: 'registerNumber' },
          { header: 'Tahun', key: 'year', align: 'center' },
          { header: 'Jumlah', key: 'quantity', align: 'right' },
          { header: 'Satuan', key: 'unit', align: 'center' },
          { header: 'Harga Satuan', key: 'unitPrice', align: 'right', isCurrency: true },
          { header: 'Nilai Total', key: 'totalValue', align: 'right', isCurrency: true },
          { header: 'Kondisi', key: 'condition' },
          { header: 'Lokasi Penempatan', key: 'locationName' },
          { header: 'Sumber Dana', key: 'fundSource' },
        ];
        break;

      case 'kib_e':
        title = 'LAPORAN KIB E (KARTU INVENTARIS BARANG — BUKU / PUSTAKA)';
        rows = inventoryItems.filter((i) => i.kib === 'KIB_E');
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'Kode Buku', key: 'itemCode' },
          { header: 'Judul Buku / Mapel / Kelas', key: 'name' },
          { header: 'Pengarang / Penerbit', key: 'author' },
          { header: 'ISBN', key: 'isbn' },
          { header: 'Tahun', key: 'year', align: 'center' },
          { header: 'Jumlah (Eks)', key: 'quantity', align: 'right' },
          { header: 'Harga Satuan', key: 'unitPrice', align: 'right', isCurrency: true },
          { header: 'Nilai Total', key: 'totalValue', align: 'right', isCurrency: true },
          { header: 'Kondisi', key: 'condition' },
          { header: 'Lokasi Penempatan', key: 'locationName' },
        ];
        break;

      case 'damaged_items':
        title = 'LAPORAN BARANG RUSAK (RINGAN & BERAT) SEKOLAH';
        rows = inventoryItems.filter((i) => i.condition === 'Rusak Ringan' || i.condition === 'Rusak Berat');
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'Kode Barang', key: 'itemCode' },
          { header: 'Nama Barang / Buku', key: 'name' },
          { header: 'KIB', key: 'kib' },
          { header: 'Jumlah', key: 'quantity', align: 'right' },
          { header: 'Kondisi Fisik', key: 'condition' },
          { header: 'Lokasi', key: 'locationName' },
          { header: 'Keterangan Kerusakan', key: 'notes' },
        ];
        break;

      case 'all_needs':
      case 'needs_urgent':
      case 'needs_unfulfilled':
      case 'budget_summary':
        title = 'REKAPITULASI USULAN KEBUTUHAN DAN KEKURANGAN BARANG INVENTARIS';
        let ndList = [...needs];
        if (reportType === 'needs_urgent') ndList = ndList.filter((n) => n.priority === 'Sangat Mendesak');
        if (reportType === 'needs_unfulfilled') ndList = ndList.filter((n) => n.quantityShortage > 0);
        rows = ndList;
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'Kode Kebutuhan', key: 'needCode' },
          { header: 'Nama Barang / Buku', key: 'name' },
          { header: 'KIB', key: 'kib' },
          { header: 'Dibutuhkan', key: 'quantityNeeded', align: 'right' },
          { header: 'Tersedia', key: 'quantityAvailable', align: 'right' },
          { header: 'Kekurangan', key: 'quantityShortage', align: 'right' },
          { header: 'Satuan', key: 'unit', align: 'center' },
          { header: 'Estimasi Harga', key: 'estimatedUnitPrice', align: 'right', isCurrency: true },
          { header: 'Estimasi Anggaran', key: 'estimatedTotalBudget', align: 'right', isCurrency: true },
          { header: 'Prioritas', key: 'priority' },
          { header: 'Lokasi', key: 'locationName' },
          { header: 'Status Pengadaan', key: 'status' },
        ];
        break;

      case 'procurement_all':
      case 'procurement_status':
        title = 'REKAPITULASI REALISASI PENGADAAN BARANG INVENTARIS SEKOLAH';
        rows = procurements;
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'No. Pengadaan', key: 'procurementNumber' },
          { header: 'Nama Barang', key: 'itemName' },
          { header: 'Jumlah Dibeli', key: 'quantityPurchased', align: 'right' },
          { header: 'Jumlah Diterima', key: 'quantityReceived', align: 'right' },
          { header: 'Harga Satuan', key: 'actualUnitPrice', align: 'right', isCurrency: true },
          { header: 'Total Nilai Pengadaan', key: 'totalProcurementValue', align: 'right', isCurrency: true },
          { header: 'Sumber Dana', key: 'fundSource' },
          { header: 'Penyedia', key: 'supplierName' },
          { header: 'Status', key: 'status' },
        ];
        break;

      case 'transfers_all':
        title = 'LAPORAN MUTASI & PERPINDAHAN PENEMPATAN BARANG INVENTARIS';
        rows = histories;
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'Tanggal', key: 'transferDate', align: 'center' },
          { header: 'Kode Barang', key: 'itemCode' },
          { header: 'Nama Barang', key: 'itemName' },
          { header: 'Ruangan Asal', key: 'fromLocationName' },
          { header: 'Ruangan Tujuan', key: 'toLocationName' },
          { header: 'Jumlah', key: 'quantityMoved', align: 'right' },
          { header: 'Petugas Mutasi', key: 'officerName' },
          { header: 'Keterangan', key: 'notes' },
        ];
        break;

      default: // all_inventory and others
        title = 'LAPORAN REKAPITULASI SELURUH INVENTARIS BARANG SEKOLAH';
        rows = inventoryItems;
        columns = [
          { header: 'No', key: '_no', align: 'center' },
          { header: 'KIB', key: 'kib', align: 'center' },
          { header: 'Kode Barang', key: 'itemCode' },
          { header: 'Nama Barang / Judul Buku', key: 'name' },
          { header: 'Tahun', key: 'year', align: 'center' },
          { header: 'Jumlah', key: 'quantity', align: 'right' },
          { header: 'Satuan', key: 'unit', align: 'center' },
          { header: 'Harga Satuan', key: 'unitPrice', align: 'right', isCurrency: true },
          { header: 'Nilai Total', key: 'totalValue', align: 'right', isCurrency: true },
          { header: 'Kondisi', key: 'condition' },
          { header: 'Lokasi Penempatan', key: 'locationName' },
          { header: 'Sumber Dana', key: 'fundSource' },
        ];
        break;
    }

    // Apply location or year or condition filter if specified
    if (selectedLocation) {
      rows = rows.filter((r) => r.locationId === selectedLocation || r.locationName === selectedLocation);
    }
    if (selectedYear) {
      rows = rows.filter((r) => String(r.year || r.targetYear) === selectedYear);
    }
    if (selectedCondition) {
      rows = rows.filter((r) => r.condition === selectedCondition);
    }

    return { title, rows, columns };
  };

  const { title, rows, columns } = getActiveReportData();

  // Export to Excel
  const handleExportXlsx = () => {
    const exportData = rows.map((row, idx) => {
      const obj: Record<string, any> = { No: idx + 1 };
      columns.forEach((col) => {
        if (col.key !== '_no') {
          obj[col.header] = row[col.key] !== undefined ? row[col.key] : '-';
        }
      });
      return obj;
    });

    exportToExcel(exportData, `${reportType}_${new Date().getFullYear()}`, 'Laporan');
  };

  // Export to Word
  const handleExportDoc = () => {
    const tableHeaders = columns.map((c) => `<th>${c.header}</th>`).join('');
    const tableRows = rows
      .map((r, idx) => {
        const tds = columns
          .map((c) => {
            const val = c.key === '_no' ? idx + 1 : r[c.key];
            const displayVal = c.isCurrency ? formatRupiah(val) : val || '-';
            const alignClass = c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : '';
            return `<td class="${alignClass}">${displayVal}</td>`;
          })
          .join('');
        return `<tr>${tds}</tr>`;
      })
      .join('');

    const letterheadHtml = `
      <table class="kop-table" style="width:100%; border:none; margin-bottom:12px;">
        <tr>
          <td style="width:75px; text-align:center; vertical-align:middle;">
            <img src="${window.location.origin}${school?.logoLeft || '/assets/logo-tutwuri.svg'}" width="70" />
          </td>
          <td style="text-align:center; vertical-align:middle; line-height:1.25;">
            <div style="font-size:12pt; font-weight:bold;">${school?.agencyName}</div>
            <div style="font-size:11pt; font-weight:bold;">${school?.educationDept}</div>
            <div style="font-size:14pt; font-weight:bold; letter-spacing:0.5px;">${school?.schoolName}</div>
            <div style="font-size:9pt; margin-top:3px;">${[school?.address, school?.village, school?.district, school?.regencyCity].filter(Boolean).join(', ')}${school?.postalCode ? ' ' + school?.postalCode : ''}</div>
            <div style="font-size:8.5pt;">Telp: ${school?.phone} | Email: ${school?.email} | NPSN: ${school?.npsn}</div>
          </td>
          <td style="width:75px; text-align:center; vertical-align:middle;">
            <img src="${window.location.origin}${school?.logoRight || '/assets/logo-sekolah.svg'}" width="70" />
          </td>
        </tr>
      </table>
      <div style="border-bottom: 3px double #000; margin-bottom: 16px;"></div>
    `;

    const signaturesHtml = `
      <table style="width:100%; border:none; margin-top:40px; font-size:10pt;">
        <tr>
          <td style="width:33%; text-align:center; border:none;">
            Mengetahui,<br/>
            <strong>${staff?.headmasterTitle || 'Kepala Sekolah'}</strong>
            <br/><br/><br/><br/>
            <strong><u>${staff?.headmasterName}</u></strong><br/>
            NIP. ${staff?.headmasterNip || '-'}
          </td>
          <td style="width:33%; text-align:center; border:none;">
            <br/>
            <strong>${staff?.propertyOfficerTitle || 'Pengurus Barang'}</strong>
            <br/><br/><br/><br/>
            <strong><u>${staff?.propertyOfficerName}</u></strong><br/>
            NIP. ${staff?.propertyOfficerNip || '-'}
          </td>
          <td style="width:33%; text-align:center; border:none;">
            ${school?.regencyCity}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            <strong>${staff?.assistantPropertyOfficerTitle || 'Pengurus Barang Pembantu'}</strong>
            <br/><br/><br/><br/>
            <strong><u>${staff?.assistantPropertyOfficerName}</u></strong><br/>
            NIP. ${staff?.assistantPropertyOfficerNip || '-'}
          </td>
        </tr>
      </table>
    `;

    const html = `
      ${letterheadHtml}
      <h3 style="text-align:center; font-size:12pt; text-transform:uppercase; margin-bottom:14px;">${title}</h3>
      <table>
        <thead><tr>${tableHeaders}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      ${signaturesHtml}
    `;

    exportToWord(html, `${reportType}_resmi_${new Date().getFullYear()}`);
  };

  // Browser Print / PDF View
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Non-printed Controls */}
      <div className="print:hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Laporan Administrasi Resmi & Ekspor
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Disediakan 22 jenis rekapitulasi data inventaris, kebutuhan, pengadaan, dan mutasi barang dengan kop surat dan tanda tangan pejabat
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportXlsx}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>
            <button
              onClick={handleExportDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Ekspor Word (.doc)</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Report Selector & Quick Filters */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Pilih Jenis Laporan (22 Rekap Tersedia)
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-indigo-500"
            >
              {reportOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Ruangan / Lokasi</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Ruangan</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Kondisi Fisik</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Semua Kondisi</option>
              <option value="Baik">Kondisi Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </select>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (WYSIWYG PAPER VIEW) */}
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0 max-w-5xl mx-auto space-y-6">
        {/* Kop Surat Resmi */}
        {school && letterhead && (
          <div className="border-b-[3px] border-double border-slate-900 pb-3">
            <div className="flex items-center justify-between gap-4">
              {letterhead.showLogoLeft && (
                <img
                  src={school.logoLeft || '/assets/logo-tutwuri.svg'}
                  alt="Logo Pemda"
                  className="w-16 h-16 object-contain shrink-0"
                />
              )}

              <div className="text-center flex-1 leading-tight space-y-0.5">
                {letterhead.showAgency && (
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {school.agencyName}
                  </p>
                )}
                {letterhead.showEducationDept && (
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {school.educationDept}
                  </p>
                )}
                {letterhead.showSchoolName && (
                  <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                    {school.schoolName}
                  </h1>
                )}
                {letterhead.showAddress && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    {[school.address, school.village, school.district, school.regencyCity].filter(Boolean).join(', ')}{school.postalCode ? ` ${school.postalCode}` : ''}
                  </p>
                )}
                {letterhead.showContactInfo && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Telp: {school.phone} · Email: {school.email} · NPSN: {school.npsn}
                  </p>
                )}
              </div>

              {letterhead.showLogoRight && (
                <img
                  src={school.logoRight || '/assets/logo-sekolah.svg'}
                  alt="Logo Sekolah"
                  className="w-16 h-16 object-contain shrink-0"
                />
              )}
            </div>
          </div>
        )}

        {/* Title of Document */}
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500">
            Tahun Anggaran {new Date().getFullYear()} · Dicetak per {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Report Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
              <tr>
                {columns.map((c, i) => (
                  <th
                    key={i}
                    className={`border border-slate-300 px-2.5 py-2 ${
                      c.align === 'center' ? 'text-center' : c.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="border border-slate-300 py-6 text-center text-slate-400">
                    Tidak ada data yang sesuai untuk laporan ini.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {columns.map((col, cIdx) => {
                      const val = col.key === '_no' ? idx + 1 : row[col.key];
                      const displayVal = col.isCurrency ? formatRupiah(val) : val !== undefined ? val : '-';
                      return (
                        <td
                          key={cIdx}
                          className={`border border-slate-300 px-2.5 py-1.5 ${
                            col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                          } ${col.isCurrency ? 'font-mono tabular-nums font-semibold' : ''}`}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signature Blocks Section 21 & 22 */}
        {staff && (
          <div className="pt-8 grid grid-cols-3 gap-6 text-xs text-center text-slate-900 break-inside-avoid">
            {/* Kepala Sekolah */}
            <div>
              <p>Mengetahui,</p>
              <p className="font-semibold">{staff.headmasterTitle || 'Kepala Sekolah'}</p>
              <div className="h-20 flex items-center justify-center text-slate-300 text-[10px] italic">
                (Tanda Tangan & Cap Resmi)
              </div>
              <p className="font-bold underline uppercase">{staff.headmasterName}</p>
              <p className="font-mono text-[11px] text-slate-600">NIP. {staff.headmasterNip || '-'}</p>
            </div>

            {/* Pengurus Barang */}
            <div>
              <p>&nbsp;</p>
              <p className="font-semibold">{staff.propertyOfficerTitle || 'Pengurus Barang'}</p>
              <div className="h-20 flex items-center justify-center text-slate-300 text-[10px] italic">
                (Tanda Tangan)
              </div>
              <p className="font-bold underline uppercase">{staff.propertyOfficerName}</p>
              <p className="font-mono text-[11px] text-slate-600">NIP. {staff.propertyOfficerNip || '-'}</p>
            </div>

            {/* Pengurus Barang Pembantu */}
            <div>
              <p>{school?.regencyCity || 'Nusantara'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold">{staff.assistantPropertyOfficerTitle || 'Pengurus Barang Pembantu'}</p>
              <div className="h-20 flex items-center justify-center text-slate-300 text-[10px] italic">
                (Tanda Tangan)
              </div>
              <p className="font-bold underline uppercase">{staff.assistantPropertyOfficerName}</p>
              <p className="font-mono text-[11px] text-slate-600">NIP. {staff.assistantPropertyOfficerNip || '-'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
