# PRODUCT REQUIREMENT DOCUMENT (PRD)
**Platform Ekosistem Digital RESURVA**

*Dokumen spesifikasi formal untuk pembangunan marketplace surplus pangan, manajemen inventaris real-time, dan engine kalkulasi jejak karbon otomatis guna menekan Food Loss and Waste (FLW) di Indonesia.*

---

## Metadata Proyek
- **Nama Proyek**: RESURVA (Resource Sustainability & Value)
- **Versi Dokumen**: v1.0 (Fase Inisiasi Proyek)
- **Tanggal**: 29 Mei 2026
- **Status**: Draft Pengajuan Ide
- **Tim Pengembang**: 
  1. Ekya Muhammad H. F.
  2. Khoirotun Nisa'
  3. Nathanael Juan Gracedo
- **Asal Institusi**: Politeknik Negeri Malang

---

## 1. Ringkasan Eksekutif & Latar Belakang
Indonesia saat ini berada dalam kondisi krisis timbulan sampah makanan (Food Loss and Waste/FLW) yang menempatkan negara ini sebagai penyumbang limbah pangan terbesar kedua di dunia setelah Arab Saudi. Sampah makanan memberikan kontribusi masif mencapai 40,76% dari total timbulan sampah nasional. Secara statistik, setiap individu di Indonesia rata-rata menghasilkan 300 kg sampah makanan per tahun, dengan akumulasi volume nasional menyentuh 23 hingga 48 juta ton. Fenomena ini tidak hanya mengancam ketahanan pangan dan kelestarian lingkungan melalui emisi gas rumah kaca dari gas metana sampah organik, melainkan juga memicu kerugian ekonomi yang fatal bagi sektor Usaha Mikro, Kecil, dan Menengah (UMKM) kuliner akibat manajemen stok manual yang buruk.

**RESURVA** hadir sebagai sebuah ekosistem digital inovatif sirkular hulu-ke-hilir yang dirancang secara spesifik untuk memitigasi krisis tersebut. Melalui integrasi marketplace surplus pangan ramah konsumen dan modul manajemen inventaris waktu nyata (*real-time tracking*), platform ini mendigitalisasi pencatatan stok produk UMKM sekaligus memantau serta mengonversi dampak lingkungan dari makanan yang diselamatkan menjadi analitik visual karbon yang transparan dan dapat dipahami secara instan.

---

## 2. Tujuan Produk & Metrik Keberhasilan (OKRs)
Pengembangan platform RESURVA ditargetkan untuk memenuhi sasaran strategis terukur demi mendukung *Sustainable Development Goals* (SDGs), khususnya SDG 9 (Industri, Inovasi, dan Infrastruktur) serta SDG 17 (Kemitraan untuk Mencapai Tujuan).

| Tujuan Strategis | Key Results / Metrik Keberhasilan | Target Garis Waktu |
| :--- | :--- | :--- |
| **Reduksi Limbah Pangan** | Menyelamatkan minimal 15% - 20% total volume produk pangan surplus milik UMKM mitra agar tidak terbuang ke TPA. | Fase 1 Pilot (3 Bulan) |
| **Digitalisasi Operasional** | Mengganti 100% pencatatan stok manual ke sistem otomatis untuk meminimalkan kesalahan pelacakan masa kedaluwarsa. | Fase 1 Pilot (3 Bulan) |
| **Transparansi Lingkungan** | Otomatisasi 100% perhitungan jejak karbon (*carbon footprint*) dari setiap transaksi makanan yang berhasil diselamatkan. | Fase Peluncuran MVP |
| **Akselerasi Ekonomi UMKM** | Meningkatkan efisiensi pemulihan biaya operasional UMKM minimal sebesar 10% dari penjualan produk near-expiry. | Fase 1 Pilot (3 Bulan) |

---

## 3. Target Pengguna (User Persona)
Ekosistem RESURVA melayani model bisnis dua sisi pasar (*Two-Sided Marketplace*) dengan karakteristik pengguna sebagai berikut:

### 3.1 Sisi Suplai: Mitra B2B (UMKM & Merchant Kuliner)
- **Profil:** Pemilik UMKM, toko roti, kafe, warung makan, atau ritel kelontong modern berskala mikro hingga menengah yang menjual produk pangan cepat rusak (*perishable goods*) di kawasan urban.
- **Rentang Usia:** 20 - 50 tahun (terbuka terhadap teknologi, namun membutuhkan UI dasbor yang sederhana).
- **Kebutuhan Utama:** Alat pencatatan inventaris digital yang praktis untuk menghindari kerugian finansial akibat barang kedaluwarsa terbuang sia-sia.

### 3.2 Sisi Permintaan: Konsumen B2C (End-User)
- **Profil:** Mahasiswa, pelajar, dan pekerja muda perkotaan yang memiliki keterbatasan anggaran bulanan namun memiliki tingkat adaptasi digital tinggi (*digital savvy*).
- **Rentang Usia:** 18 - 35 tahun.
- **Kebutuhan Utama:** Akses terhadap pangan berkualitas layak konsumsi dengan harga miring (diskon tinggi), serta memiliki kepedulian sosial-lingkungan terhadap isu keberlanjutan.

---

## 4. Ruang Lingkup Produk & Batasan Fitur (Scope & Limitations)
Untuk memastikan efektivitas implementasi pada fase awal, batasan ruang lingkup platform didefinisikan sebagai berikut:
- **Batasan Wilayah Geografis:** Fase percontohan (*pilot project*) hanya diimplementasikan secara terbatas bagi 6 hingga 10 UMKM kuliner di area perkotaan padat, dengan fokus utama di wilayah Kota Malang atau Jabodetabek.
- **Karakteristik Produk Pangan:** Produk yang diizinkan untuk dipasarkan pada aplikasi konsumen hanyalah kategori makanan surplus layak makan atau produk jadi/bahan baku yang berada dalam rentang masa mendekati kedaluwarsa (*near-expiry goods*).
- **Validitas Data Inventaris:** Pengisian input tanggal kedaluwarsa (*expiry date tracking*) bersifat mandatori (wajib) bagi merchant. Tanggung jawab kualitas fisik makanan sepenuhnya berada pada kontrol merchant.
- **Tingkat Kecerdasan Buatan (AI):** Penerapan kecerdasan buatan pada backend pada fase awal dibatasi pada algoritma berbasis aturan (*rule-based engine*) dan machine learning sederhana untuk keperluan modul rekomendasi optimasi stok serta estimasi limbah.

---

## 5. Arsitektur Teknologi (Tech Stack)
Sistem dikembangkan menggunakan arsitektur microservices yang terdistribusi guna menjamin fleksibilitas operasional, isolasi kegagalan modul, serta skalabilitas tinggi.

- **Frontend Web (Merchant & Enterprise):** Menggunakan framework **Next.js** berbasis React untuk performa render cepat, didukung library visualisasi data **Chart.js** dan animasi interaktif **GSAP**.
- **Frontend Mobile (Konsumen):** Dikembangkan dengan framework **Flutter** untuk kompilasi lintas platform (Android & iOS) yang responsif dan berkinerja tinggi.
- **Backend Services:** Menggunakan **FastAPI (Python)** sebagai core backend microservices karena memiliki latensi rendah dan mendukung pemrosesan data analitik/sains data secara natively untuk *Waste & Carbon Engine*.
- **Manajemen Data & Penyimpanan:** - **PostgreSQL:** Digunakan sebagai database relasional utama untuk menyimpan data transaksi, profil user, dan log inventaris.
  - **Redis:** Bertindak sebagai *caching layer* performa tinggi untuk mendukung mekanisme pembaruan cepat (*flash sale*) dan agregasi dasbor analytics.
- **Integrasi Pihak Ketiga (Third-Party APIs):**
  - **Payment Gateway (Xendit API):** Menangani transaksi pembayaran multi-kanal secara otomatis (E-wallet, VA, Transfer Bank).
  - **Logistics Aggregator (Biteship API):** Menghubungkan pesanan dengan jaringan kurir logistik instan lokal untuk penjemputan barang.
  - **Maps Service (Google Maps API):** Digunakan pada aplikasi mobile untuk pencarian produk berbasis geolocation/radius terdekat pengguna.

---

## 6. Jumlah Aktor, Modul Web, dan Aplikasi
Ekosistem RESURVA secara total mengintegrasikan **3 Aktor Pengguna** yang beroperasi melalui **2 Aplikasi Web Khusus, 1 Aplikasi Mobile, serta 1 Landing Page Publik**. 

| No | Nama Platform / Modul | Jenis Platform | Aktor Pengakses Utama | Fungsi Utama Modul |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Landing Page RESURVA** | Web Browser (Public) | Umum / Calon Mitra | Pemasaran produk, akuisisi pengguna, dan portal pendaftaran awal merchant. |
| 2 | **RESURVA Mobile Application** | Aplikasi Mobile (Android/iOS) | Aktor Konsumen (B2C) | Pencarian makanan surplus, transaksi checkout, dan tracker jejak karbon personal. |
| 3 | **Web Merchant Dashboard** | Web Browser (Desktop) | Pemilik UMKM & Staf Toko | Input inventaris real-time, manajemen kedaluwarsa, dan pemrosesan pesanan surplus. |
| 4 | **Web Enterprise Dashboard** | Web Browser (Desktop) | Superadmin / Manajemen Bisnis | Kontrol multi-cabang, konfigurasi emisi, analitik limbah makro, dan pelaporan SDG. |

---

## 7. Spesifikasi Fitur Utama Setiap Platform

### 7.1 RESURVA Mobile Application (Sisi Konsumen)
- **Pencarian Berbasis Lokasi (*Geo-Location Food Discovery*):** Menggunakan integrasi Google Maps API untuk menyajikan daftar merchant makanan surplus terdekat dalam radius kilometer tertentu dari titik GPS pengguna.
- **Sistem Pembelian & Pembayaran Instan:** Checkout produk terintegrasi Payment Gateway (Xendit), memungkinkan transaksi aman langsung dalam aplikasi via QRIS, e-wallet, atau Virtual Account.
- **Personal Sustainability Counter:** Widget visual di halaman profil pengguna yang menampilkan akumulasi metrik dampak lingkungan pribadi (total kg makanan yang diselamatkan dan setara reduksi kg CO2e) semenjak bergabung.
- **Notifikasi Flash Sale Otomatis:** Push notification real-time yang memicu alarm perangkat konsumen saat merchant terdekat mengaktifkan diskon kilat untuk produk yang masa kedaluwarsanya di bawah 24 jam.

### 7.2 Web Merchant Dashboard (Sisi UMKM & Staf)
- **Manajemen Inventaris Waktu Nyata (*Real-Time Expiry Tracker*):** Modul pencatatan stok digital di mana setiap item wajib diinput bersama kuantitas dan tanggal kedaluwarsa. Sistem akan otomatis memberikan penanda warna (merah, kuning, hijau) berdasarkan sisa hari layak konsumsi.
- **Automated Surplus Marketplace Listing:** Fitur pemindahan otomatis status produk dari "stok reguler" ke "stok marketplace surplus" dengan penyesuaian harga (diskon teratur) saat mendeteksi ambang batas hari kedaluwarsa mendekat tanpa perlu input ulang.
- **AI Stock Optimization Recommendation:** Engine cerdas berbasis data historis penjualan yang memberikan rekomendasi jumlah produksi harian berikutnya kepada merchant guna menghindari masalah kelebihan stok produksi (*overstock*).
- **Integrasi Otomatisasi Kurir:** Saat ada pesanan masuk dari konsumen, sistem memicu API Biteship untuk mencari kurir terdekat guna melakukan penjemputan (*pickup*) pesanan secara otomatis tanpa intervensi manual staff.

### 7.3 Web Enterprise Dashboard (Sisi Superadmin & Multi-Cabang)
- **Waste Analytics & Multi-Branch Control:** Dasbor komprehensif bagi pemilik bisnis skala besar (franchise/multi-cabang) untuk memantau performa penjualan, total kerugian finansial yang dihindari, serta efektivitas pengelolaan limbah di masing-masing cabang dari satu tempat.
- **Sustainability Reporting Module:** Modul penyusun laporan keberlanjutan otomatis berstandar SDGs yang menyajikan visualisasi grafik interaktif mengenai total sampah organik yang dirededuksi dan kontribusi terhadap pencegahan emisi karbon korporasi.
- **Leaderboard Kinerja Merchant:** Fitur pemeringkat cabang atau mitra UMKM paling aktif dalam mereduksi limbah pangan untuk memfasilitasi program pemberian insentif atau penghargaan.

---

## 8. Alur Kerja Pengguna (User Flow)
Integrasi proses end-to-end antar sistem berjalan secara linear dan sinkron dengan detail tahapan sebagai berikut:
1. **Tahap Input Inventaris:** Staf UMKM login ke Web Merchant Dashboard lalu melakukan pengisian data produk harian. Data mutlak mencakup nama produk, kategori, jumlah unit, harga dasar, dan tanggal kedaluwarsa produk.
2. **Tahap Pemrosesan Backend & Engine Analitik:** Data dari Web Merchant dikirim ke Backend FastAPI untuk disimpan di PostgreSQL. Secara paralel, Waste & Carbon Engine memproses data untuk melacak potensi masa simpan serta menghitung prediksi skor dampak karbon lingkungan jika makanan tersebut tidak terjual.
3. **Tahap Publikasi & Notifikasi:** Apabila sistem mendeteksi produk mendekati hari kedaluwarsa, produk langsung diterbitkan ke RESURVA Mobile App. Sistem otomatis memicu Redis untuk menyebarkan Push Notification "Flash Sale" kepada konsumen terdekat dalam radius wilayah tersebut.
4. **Tahap Pembelian oleh Konsumen:** Konsumen membuka aplikasi mobile, melihat promo, lalu melakukan checkout dan pembayaran via Xendit. Setelah pembayaran divalidasi sukses, sistem memicu API Biteship untuk memanggil kurir penjemputan menuju outlet UMKM.
5. **Tahap Konversi Dampak Lingkungan:** Pasca kurir menyelesaikan pengiriman barang kepada konsumen, status transaksi berubah menjadi 'Selesai'. Engine kalkulator karbon akan langsung memperbarui grafik akumulatif dampak lingkungan, baik pada profil personal konsumen di aplikasi mobile maupun pada laporan agregat SDGs di Web Enterprise Dashboard.

---

## 9. Spesifikasi Perhitungan Dampak Karbon Lingkungan
Modul Carbon Analytics Engine beroperasi di bawah metodologi ilmiah pendekatan **Life Cycle Assessment (LCA)**. Engine melacak emisi terhindar (*prevented emissions*) dengan mengasumsikan bahwa setiap makanan surplus yang berhasil dikonsumsi manusia setara dengan membatalkan emisi destruktif dari pembusukan sampah organik di TPA (yang melepas gas metana CH4) serta menghargai energi produksi yang telah dikeluarkan di hulu.

### 9.1 Algoritma Kalkulasi Inti
Perhitungan matematika di dalam sistem backend FastAPI mengikuti rumus linier berbobot di bawah ini:

`E_saved = Σ (W_food_i * EF_category_i)`

Dimana variabel didefinisikan sebagai:
- **E_saved** = Total emisi karbon yang berhasil diselamatkan/dihindari (satuan: kg CO2e).
- **W_food_i** = Berat bersih atau kuantitas setara berat produk pangan jenis *i* yang terjual/diselamatkan (satuan: kg).
- **EF_category_i** = Faktor Emisi spesifik untuk kategori pangan *i* yang ditentukan berdasarkan basis data sekunder resmi (satuan: kg CO2e / kg produk).

### 9.2 Contoh Studi Kasus Operasional
Bila sistem mencatat transaksi sukses penyelamatan produk berupa `0.5 kg` olahan daging sapi surplus dari sebuah resto mitra, dan database menyimpan Faktor Emisi kategori olahan daging sebesar `27.0 kg CO2e / kg`, maka engine mengeksekusi perhitungan berikut:

`E_saved = 0.5 kg * 27.0 kg CO2e/kg = 13.5 kg CO2e`

### 9.3 Mekanisme Konversi Padanan Publik (EPA Equivalencies Engine)
Skor mentah dalam bentuk angka desimal (kg CO2e) sering kali terlalu abstrak. Oleh karena itu, platform mengadopsi rumus konversi standar *Greenhouse Gas Equivalencies Calculator* dari EPA (Environmental Protection Agency) untuk mengubah nilai emisi terhindar ke dalam visualisasi metafora:
- **Padanan Penyerapan Pohon:** Total emisi terhindar dikonversi ke jumlah setara bibit pohon yang tumbuh selama 10 tahun (Konverter standar: `1 kg CO2e ≈ 0.016 pohon`).
- **Padanan Penghematan Konsumsi Bensin:** Nilai emisi dikonversi ke jarak tempuh kendaraan berbahan bakar bensin rata-rata yang berhasil dieliminasi (Konverter standar: `1 kg CO2e ≈ 4.1 km`).
- **Padanan Konsumsi Energi Listrik:** Emisi dikonversi ke durasi jam penggunaan daya listrik lampu atau pengisian daya ponsel pintar (Konverter standar: `1 kg CO2e ≈ 120 jam charging smartphone`).

> **Catatan Implementasi Backend:** Seluruh konstanta matriks Faktor Emisi (EF) disimpan di tabel konfigurasi metadata PostgreSQL di bawah pengawasan Web Enterprise Dashboard Superadmin agar dapat diperbarui secara berkala.
