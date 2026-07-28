# SplitEase — Smart Receipt Splitter

SplitEase adalah aplikasi web modern yang dirancang untuk membantu pengguna membagi tagihan restoran dengan adil dan akurat. Aplikasi ini menghilangkan perhitungan manual dengan memanfaatkan teknologi OCR (Optical Character Recognition) untuk membaca nota/struk secara otomatis, serta menyediakan antarmuka yang intuitif untuk mengalokasikan pesanan ke masing-masing partisipan.

## 🌟 Fitur Utama

- **📸 Scanner OCR (Tesseract.js)**: Ambil foto atau unggah gambar nota. Aplikasi akan mengekstrak nama restoran, tanggal, daftar item, harga, pajak, dan service charge secara otomatis.
- **✍️ Editor Manual**: Karena OCR tidak selalu sempurna, tersedia editor manual yang mudah digunakan untuk memperbaiki hasil scan atau memasukkan tagihan secara manual dari awal.
- **👥 Manajemen Partisipan**: Tambah partisipan dengan mudah. Setiap partisipan mendapatkan avatar dengan warna unik.
- **🎯 Assign Item (Bagi Tagihan)**:
  - **Individual**: Tugaskan item ke satu orang.
  - **Shared (Bagi Rata)**: Satu item bisa ditugaskan ke beberapa orang sekaligus, dan harganya akan otomatis dibagi rata (contoh: 1 porsi Nasi Goreng dibagi 2 orang).
- **💸 Kalkulasi Pajak & Service**: Opsi untuk membagi pajak dan *service charge* secara proporsional berdasarkan total pesanan masing-masing partisipan, atau mematikannya jika tidak diperlukan.
- **📊 Ringkasan Kalkulasi**: Menampilkan total yang harus dibayar oleh masing-masing orang secara rinci (subtotal, pajak, service).
- **📤 Share & Copy**: Bagikan hasil tagihan dengan mudah melalui WhatsApp atau salin ke clipboard.
- **🕒 Riwayat (History)**: Hasil perhitungan disimpan secara lokal di browser, memungkinkan pengguna untuk melihat kembali riwayat tagihan sebelumnya.
- **📱 Mobile-First Design**: UI/UX dirancang khusus untuk kenyamanan penggunaan di perangkat mobile.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **OCR Engine**: [Tesseract.js](https://github.com/naptha/tesseract.js) (Mendukung bahasa Indonesia & Inggris)
- **State Management**: React Context & `useReducer`
- **Penyimpanan**: `localStorage` (untuk riwayat)

## 🚀 Cara Menjalankan Proyek (Development)

Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) di sistem Anda.

1. **Clone repository** (jika belum):
   ```bash
   git clone <repo-url>
   cd splitease/splitease-app
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan *development server***:
   ```bash
   npm run dev
   ```

4. **Buka di Browser**:
   Buka [http://localhost:3000](http://localhost:3000) untuk melihat aplikasi. Untuk pengalaman terbaik, gunakan mode responsif (Mobile View) di Developer Tools browser Anda.

## 🏗️ Alur Aplikasi (Navigation Flow)

Aplikasi ini menggunakan sistem *internal navigation stack* (`screenStack`) di dalam Global State untuk memastikan tombol "Back" (baik di dalam aplikasi maupun tombol bawaan HP) selalu mengembalikan pengguna ke halaman yang benar.

1. **Home (`/`)**: Dashboard utama, akses ke Scanner, Input Manual, dan Riwayat.
2. **Scanner / Upload Foto**: Antarmuka kamera kustom untuk mengambil foto nota.
3. **Processing**: Layar loading saat Tesseract.js sedang mengekstrak teks dari gambar (terdapat *progress bar* real-time).
4. **Receipt Preview / Editor**: Menampilkan hasil OCR yang bisa diedit. Pengguna juga bisa masuk ke sini langsung via "Input Manual".
5. **Participants**: Layar untuk menambahkan nama-nama orang yang ikut patungan.
6. **Item Assignment**: Layar utama tempat pengguna menugaskan item ke partisipan (bisa multi-select untuk membagi harga).
7. **Tax & Service**: Pengaturan persentase pajak dan layanan.
8. **Summary**: Ringkasan akhir tagihan per orang. Bisa dibagikan atau disimpan ke riwayat.

## 🧠 Struktur State (Core Logic)

Logika perhitungan dan navigasi berpusat di `src/lib/store.ts` dan `src/context/AppContext.tsx`.

- **Sistem Harga**: Menggunakan model *Unit Price*. `Total Harga = Harga Satuan × Quantity`.
- **Kalkulasi Tagihan**: Saat sebuah item ditugaskan ke beberapa orang (dalam satu grup *assignment*), `Total Harga` item tersebut dibagi rata sejumlah partisipan di dalam grup tersebut.
- **Pajak & Service Proporsional**: Pajak per individu dihitung berdasarkan persentase total pesanan mereka terhadap subtotal keseluruhan (bukan dibagi rata ke semua orang).
- **Navigasi Handal**: Menggunakan interceptor `popstate` dan `screenStack` agar tombol back hardware HP tersinkronisasi dengan navigasi virtual di dalam React.

## 📝 Catatan Rilis (Version History)

- **v3 (Current)**:
  - Implementasi Tesseract.js untuk OCR asli (bukan data dummy).
  - Perbaikan logika tombol Back HP dengan `screenStack`.
  - Penyempurnaan input angka (qty bisa dihapus/kosong sementara, harga diformat dengan pemisah ribuan saat diketik).
  - Model *AssignmentGroup* untuk menangani *multi-sharing* item yang kompleks.

---
*Dibuat untuk memudahkan pertemanan tanpa harus pusing menghitung tagihan.*
