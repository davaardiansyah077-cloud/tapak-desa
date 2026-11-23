# TAPAK DESA — MVP 0.1

Prototype website responsif + Progressive Web App (PWA) untuk membantu Koperasi Desa/Kelurahan Merah Putih memetakan potensi, mencatat bukti pasar, menghitung indikator kelayakan sederhana, membandingkan alternatif usaha, dan memantau realisasi.

## Fitur
- Dashboard ringkasan koperasi dan alternatif usaha.
- Pemetaan potensi desa.
- Pencatatan bukti pasar: indikatif, terkonfirmasi, komitmen.
- Analisis finansial sederhana: margin kontribusi, BEP, omzet, estimasi laba operasional.
- Skor berbobot indikatif dan pemeriksaan gerbang kritis.
- Monitoring omzet dan biaya aktual.
- Ekspor CSV dan cadangan/pemulihan JSON.
- Penyimpanan lokal browser (`localStorage`).
- PWA: dapat diinstal pada perangkat yang mendukung dan memiliki cache offline dasar.

## Menjalankan secara lokal
Cara termudah menggunakan VS Code + ekstensi Live Server, atau jalankan server statis:

```bash
python -m http.server 8000
```

Kemudian buka `http://localhost:8000`.

## Deploy ke GitHub dan Vercel
1. Buat repository baru di GitHub.
2. Upload seluruh isi folder ini ke root repository (pastikan `index.html` berada di root).
3. Di Vercel pilih **Add New → Project**, impor repository GitHub.
4. Framework Preset: **Other**.
5. Build Command: kosongkan / None.
6. Output Directory: `.`
7. Install Command: kosongkan / None.
8. Klik Deploy.

Konfigurasi `vercel.json` sudah disediakan untuk hosting static dan fallback SPA.

## Catatan penting sebelum digunakan sungguhan
- Ini adalah prototipe frontend. Belum ada backend, autentikasi, database cloud, sinkronisasi lintas perangkat, atau kontrol akses multi-pengguna.
- Data disimpan di browser/perangkat yang digunakan. Gunakan menu Profil → Ekspor cadangan JSON secara berkala.
- Jangan memasukkan data pribadi sensitif atau dokumen rahasia ke prototipe ini.
- Skor dan bobot merupakan contoh awal, bukan standar resmi pemerintah. Perlu validasi bersama Kementerian/Dinas Koperasi, pendamping, ahli keuangan, dan koperasi percontohan.
- Perhitungan laba saat ini adalah margin kontribusi dikurangi biaya tetap. Belum memperhitungkan pajak, depresiasi, bunga, perubahan modal kerja, persediaan, piutang, atau nilai waktu uang.
- Status “Layak secara awal” hanya indikasi berdasarkan data yang diinput, bukan keputusan resmi, jaminan keuntungan, atau persetujuan pembiayaan.
- Untuk produksi, perlu backend aman, audit trail, autentikasi, enkripsi, backup, persetujuan akses, dan integrasi resmi SIMKOPDES melalui API yang diizinkan.

## Struktur
```
index.html
styles.css
app.js
manifest.webmanifest
sw.js
vercel.json
assets/icon.svg
README.md
```
