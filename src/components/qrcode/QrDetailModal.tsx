import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { InventoryItem, SchoolSettings } from '../../types';
import { api } from '../../api';
import { generateItemQrData } from '../../utils/formatters';
import { QrCode, Download, Printer, X } from 'lucide-react';

interface QrDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export const QrDetailModal: React.FC<QrDetailModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [school, setSchool] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    api.getSchoolSettings().then(setSchool).catch(console.error);
  }, []);

  useEffect(() => {
    if (item) {
      const qrText = generateItemQrData(item);
      QRCode.toDataURL(qrText, {
        width: 320,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${item.itemCode.replace(/\./g, '_')}_${item.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank', 'width=600,height=450');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Label Inventaris - ${item.name}</title>
        <style>
          @page { size: auto; margin: 0; }
          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 15px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .label-card {
            border: 2px solid #000;
            padding: 10px;
            width: 340px;
            box-sizing: border-box;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 1.5px solid #000;
            padding-bottom: 5px;
            margin-bottom: 8px;
          }
          .school-title {
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .sub-title {
            font-size: 9px;
            color: #333;
          }
          .body {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .qr-img {
            width: 80px;
            height: 80px;
          }
          .meta {
            font-size: 10px;
            line-height: 1.35;
          }
          .meta strong {
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="label-card">
          <div class="header">
            <div class="school-title">${school?.schoolName || 'UPTD SD NEGERI 01 TELADAN'}</div>
            <div class="sub-title">LABEL ASET INVENTARIS SEKOLAH</div>
          </div>
          <div class="body">
            <img src="${qrDataUrl}" class="qr-img" />
            <div class="meta">
              <div><strong>Kode:</strong> ${item.itemCode}</div>
              <div><strong>Nama:</strong> ${item.name}</div>
              <div><strong>Register:</strong> ${item.registerNumber || '-'}</div>
              <div><strong>Lokasi:</strong> ${item.locationName}</div>
              <div><strong>Tahun:</strong> ${item.year} · <strong>Kondisi:</strong> ${item.condition}</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">QR Code & Label Barang</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sticker Label Preview */}
        <div className="p-4 bg-slate-50 border-2 border-slate-900 rounded-xl space-y-3">
          <div className="text-center border-b border-slate-900 pb-2">
            <p className="font-bold text-xs uppercase tracking-tight text-slate-900">
              {school?.schoolName || 'UPTD SD NEGERI 01 TELADAN NUSANTARA'}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              LABEL RESMI ASET & INVENTARIS SEKOLAH
            </p>
          </div>

          <div className="flex items-center gap-4">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-24 h-24 rounded border border-slate-200 bg-white p-1 shrink-0"
              />
            )}
            <div className="text-xs space-y-1 text-slate-800">
              <p>
                <span className="text-slate-500">Kode:</span>{' '}
                <span className="font-mono font-bold text-slate-900">{item.itemCode}</span>
              </p>
              <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
              <p>
                <span className="text-slate-500">Register:</span>{' '}
                <span className="font-mono text-slate-700">{item.registerNumber || '-'}</span>
              </p>
              <p>
                <span className="text-slate-500">Lokasi:</span>{' '}
                <span className="font-medium text-indigo-700">{item.locationName}</span>
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Tahun: {item.year} · Kondisi: {item.condition}
              </p>
            </div>
          </div>
        </div>

        {/* QR Payload Details */}
        <div className="text-[11px] bg-slate-100 p-2.5 rounded-lg text-slate-600 space-y-0.5">
          <p className="font-semibold text-slate-700">Informasi QR Code:</p>
          <p>Dapat dipindai oleh smartphone atau scanner inventaris untuk verifikasi aset fisik langsung di lapangan.</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={handleDownloadQr}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PNG</span>
          </button>
          <button
            onClick={handlePrintLabel}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Stiker Label</span>
          </button>
        </div>
      </div>
    </div>
  );
};
