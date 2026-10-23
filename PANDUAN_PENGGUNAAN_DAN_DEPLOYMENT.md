# DOKUMENTASI SISTEM INFORMASI MANAJEMEN ASET SEKOLAH (SIM-ASET)
## Aplikasi Inventaris Barang Sekolah Berbasis Web, Realtime, dan Multi-Pengguna

---

### 1. RINGKASAN APLIKASI
SIM-ASET adalah sistem manajemen aset dan inventaris sekolah terintegrasi yang dirancang untuk kegiatan administrasi sekolah sehari-hari sesuai regulasi pengelolaan Barang Milik Daerah (BMD) dan Permendikbudristek:
- **KIB B**: Pengelolaan Peralatan dan Mesin (komputer, laptop, printer, proyektor, mebeler meja/kursi, dsb).
- **KIB E**: Pengelolaan Buku (buku teks Kurikulum Merdeka, buku fiksi/non-fiksi perpustakaan).
- **Semua Inventaris**: Master rekapitulasi terpadu seluruh aset fisik sekolah.
- **Kebutuhan Barang**: Usulan kebutuhan barang dengan rumus otomatis:
  $$\text{Kekurangan} = \max(0, \text{Dibutuhkan} - \text{Tersedia})$$
  $$\text{Estimasi Anggaran} = \text{Kekurangan} \times \text{Harga Satuan}$$
- **Pengadaan Terintegrasi**: Alur Kebutuhan $\rightarrow$ Pengajuan $\rightarrow$ Persetujuan $\rightarrow$ Pengadaan $\rightarrow$ Penerimaan $\rightarrow$ Otomatis Masuk ke Inventaris KIB B/E & Mengurangi Kekurangan.
- **Stiker Label & QR Code**: Pembuatan QR Code instan, unduh PNG, cetak stiker individual & cetak massal format A4, serta pemindai (scanner) aset fisik di lapangan.
- **22 Jenis Rekap Laporan**: Format standar siap cetak atau ekspor ke **Excel (.xlsx)**, **Word (.doc)**, dan **PDF/Cetak**.
- **Kop Surat & Identitas Pejabat Dinamis**: Konfigurasi kop surat resmi (logo kiri Tut Wuri, logo kanan sekolah, garis pembatas ganda) dan penyesuaian pejabat penandatangan (Kepala Sekolah, Pengurus Barang, dan **Pengurus Barang Pembantu**) langsung dari aplikasi tanpa menyentuh kode program.
- **Sinkronisasi Multi-Perangkat Realtime**: Server-Sent Events (SSE) yang menyinkronkan data antar-perangkat secara otomatis tanpa perlu refresh manual.
- **Keamanan RBAC & Mode Monitoring Kepala Sekolah**: Akun Kepala Sekolah memiliki mode pengawasan *Read-Only* ketat di sisi server dengan fitur khusus **Catatan / Koreksi Data** untuk mengarahkan petugas.

---

### 2. AKUN PENGGUNA STANDAR UNTUK PENGUJIAN
Aplikasi dilengkapi tombol **Simulasi Gawai / Peran** di pojok kanan atas untuk berpindah peran secara instan:

| Peran | Username | Password | Wewenang Utama |
|---|---|---|---|
| **Tenaga Administrasi (Gawai A)** | `admin_tu` | `password123` | Input data inventaris, input usulan kebutuhan, pantau pengadaan, import/export Excel, audit trail. |
| **Pengurus Barang (Gawai B)** | `pengurus_barang` | `password123` | Kelola KIB B & E, nomor register, mutasi/perpindahan ruangan, cetak QR label, terima barang pengadaan ke inventaris, edit nama pejabat. |
| **Kepala Sekolah (Gawai C)** | `kepala_sekolah` | `password123` | **Mode Monitoring (Read-Only)**. Memantau nilai aset, kekurangan, anggaran, pengadaan, akuntabilitas penginput data, serta mengirim **Catatan Koreksi Data** kepada staf. |
| **Administrator IT** | `superadmin` | `password123` | Kelola akun pengguna, master data, konfigurasi kop surat, profil sekolah, backup & restore database, audit logs. |

---

### 3. PANDUAN PENGGUNAAN FITUR UTAMA

#### A. Mengelola KIB B & KIB E
1. Buka menu **KIB B - Peralatan & Mesin** atau **KIB E - Buku**.
2. Klik tombol **Tambah Barang**.
3. Isi data wajib (Kode Barang, Nama, Tahun, Jumlah, Satuan, Harga Satuan, Kondisi, dan Lokasi Ruangan).
4. Nilai total aset akan dihitung secara otomatis $(\text{Jumlah} \times \text{Harga Satuan})$.
5. Pengguna dapat mengunggah foto fisik barang (maksimal 5MB) dan menyimpan ke database.

#### B. Pindahkan Penempatan Fisik Barang
1. Pada baris barang di tabel KIB B atau KIB E, klik ikon **Mutasi Lokasi** (ikon panah bolak-balik).
2. Pilih ruangan tujuan baru, masukkan jumlah barang yang dipindahkan, tanggal mutasi, dan alasan pemindahan.
3. Klik **Konfirmasi Pindah**. Lokasi barang pada inventaris otomatis terbarui dan riwayat tersimpan permanen di menu **Riwayat Perpindahan**.

#### C. Usulan Kebutuhan & Integrasi Pengadaan
1. Buka menu **Kebutuhan Barang**. Klik **Usul Kebutuhan Baru**.
2. Masukkan nama barang, jumlah yang dibutuhkan, dan perkiraan harga satuan.
3. Sistem secara otomatis memindai stok fisik yang tersedia di sekolah, menghitung kekurangan barang, dan mengalikan dengan harga satuan untuk memperoleh estimasi total anggaran.
4. Klik tombol **Pengadaan** pada baris kebutuhan untuk langsung meneruskan usulan ke tahap pengadaan.
5. Pada menu **Pengadaan Barang**, setelah barang tiba dari penyedia SIPLah, klik tombol **Terima Barang**.
6. Sistem akan membuka verifikasi penerimaan: pilih lokasi ruangan fisik dan nomor register. Setelah dikonfirmasi, sistem secara atomik memasukkan barang ke inventaris KIB B/E, mencatat tanggal penerimaan, dan mengurangkan kekurangan kebutuhan menjadi terpenuhi/selesai.

#### D. Cetak Label & QR Code
1. Klik ikon **QR Code** pada setiap barang untuk melihat pratinjau stiker aset dan mengunduh berkas PNG.
2. Buka menu **Cetak Label & QR Code** untuk memilih beberapa barang sekaligus dan mencetak stiker massal pada lembar kertas format A4.
3. Buka menu **Pindai QR Code** untuk memasukkan atau memindai kode barang secara langsung guna memverifikasi kondisi dan lokasi fisik aset di lapangan.

#### E. Import & Export Excel
1. Klik tombol **Import Excel** pada halaman KIB B atau KIB E.
2. Klik tombol **Download Template** untuk mendapatkan berkas template XLSX terstruktur.
3. Unggah file Excel yang telah diisi. Sistem akan membaca baris, memeriksa kelengkapan data, mendeteksi duplikasi kode, dan menampilkan pratinjau data valid vs data bermasalah beserta rincian kesalahannya.
4. Klik **Konfirmasi Import** untuk menyimpan seluruh baris valid ke database pusat.

#### F. Pengaturan Kop Surat & Nama Pejabat
1. **Kop Surat**: Buka menu **Pengaturan Kop Surat**. Di halaman ini tersedia pratinjau langsung (*Live WYSIWYG Preview*). Anda dapat mengatur logo kiri/kanan, menampilkan/menyembunyikan baris identitas, mengubah ukuran logo, ketebalan garis pembatas, dan ukuran font.
2. **Pejabat & Pengurus Barang Pembantu**: Buka menu **Pejabat & Pengurus Barang**. Anda dapat memperbarui nama serta NIP Kepala Sekolah, Pengurus Barang, Pengurus Barang Pembantu, dan Tenaga Administrasi kapan saja. Seluruh lembar laporan dinas dan cetak PDF akan secara otomatis menggunakan nama terbaru.

---

### 4. DOKUMENTASI DEPLOYMENT CPANEL & HOSTING

#### Persyaratan Server:
- **Node.js Environment**: Node.js versi 18, 20, atau 22 (LTS) didukung oleh cPanel "Setup Node.js App" / Phusion Passenger / VPS.
- **Port**: Dikelola secara otomatis oleh Passenger/Reverse Proxy cPanel.
- **Folder Permission**: Izin tulis `0755` pada direktori `data/` untuk penyimpanan database lokal dan berkas backup snapshot.

#### Langkah Instalasi cPanel:
1. Unggah seluruh berkas proyek ke direktori aplikasi Anda (misal `public_html/simaset` atau `apps/simaset`).
2. Di cPanel, buka menu **Setup Node.js App**.
3. Buat aplikasi baru:
   - **Node.js Version**: Pilih `20.x` atau `22.x`.
   - **Application Mode**: `Production`.
   - **Application Root**: Jalur folder proyek (misal `simaset`).
   - **Application Startup File**: `server.ts` (menggunakan tsx) atau `dist-server/server.js`.
4. Jalankan perintah instalasi dependensi melalui terminal atau tombol **Run NPM Install** di antarmuka cPanel.
5. Jalankan `npm run build` untuk memproduksi aset frontend produksi di folder `dist`.
6. Klik **Restart Application**. Aplikasi SIM-ASET sekarang aktif dan dapat diakses dari browser maupun smartphone.
