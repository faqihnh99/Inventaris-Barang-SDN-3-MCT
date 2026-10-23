import * as XLSX from 'xlsx';
import { InventoryItem } from '../types';

export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
}

// Builds the QR Code text payload formatted for school asset auditing
export function generateItemQrData(item: InventoryItem): string {
  const payload = {
    simaset_id: item.id,
    kode_barang: item.itemCode,
    nama: item.name,
    kib: item.kib,
    register: item.registerNumber || '-',
    lokasi: item.locationName,
    kondisi: item.condition,
    tahun: item.year,
    url: `${window.location.origin}/?view=detail&itemId=${item.id}`,
  };
  return JSON.stringify(payload);
}

// Export array of objects to Excel .xlsx with column auto-width
export function exportToExcel(data: Record<string, any>[], fileName: string, sheetName = 'Data') {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diekspor.');
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Set column widths
  const keys = Object.keys(data[0] || {});
  ws['!cols'] = keys.map((key) => ({
    wch: Math.max(key.length + 3, 15),
  }));

  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

// Export clean formatted HTML document to Word (.doc)
export function exportToWord(htmlContent: string, fileName: string) {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${fileName}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 10px; }
        th, td { border: 1px solid #333; padding: 6px 8px; font-size: 10pt; }
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .kop-table { border: none !important; margin-bottom: 2px; }
        .kop-table td { border: none !important; }
      </style>
    </head>
    <body>
  `;
  const footer = '</body></html>';
  const fullSource = header + htmlContent + footer;

  const blob = new Blob(['\ufeff' + fullSource], {
    type: 'application/msword',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
