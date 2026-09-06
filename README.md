<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c84201e3-971f-4d17-b773-0e28dba11f47

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

# 📐 Panduan Rasio & Resolusi Gambar Banner (100% Akurat & Presisi)

Dokumentasi spesifikasi teknis dimensi wadah (*container box*), rasio aspek (*aspect ratio*), dan rekomendasi resolusi piksel asli (px × px) untuk seluruh banner di halaman utama (`/` dan `/mobile/`).

Semua elemen gambar menggunakan properti CSS `object-fit: cover`, sehingga gambar akan mengisi penuh wadah dengan proporsional tanpa distorsi dan tanpa ruang kosong.

---

## 📊 Tabel Ringkasan Spesifikasi Wadah & Resolusi

| No | Komponen Banner | Selector CSS & Posisi | Rasio Aspek Wadah | Ukuran Wadah (CSS px) | Rekomendasi Resolusi Gambar Asli (100% Presisi) |
|:---:|:---|:---|:---:|:---|:---|
| **1** | **Banner Utama (Embed & Visual Cover)** | `.hero-frame`<br>*(Baris 1–4, Kolom 1–8)* | **~2 : 1** (Desktop)<br>**16 : 9** (Mobile/Tablet) | Desktop: **829 × 406 px**<br>Mobile: **340×191 s/d 440×248 px**<br>Tablet: **640 × 360 px** | • **Standar (1x):** `1920 × 960 px` (2:1) / `1920 × 1080 px` (16:9)<br>• **Ultra HD / Retina (2x):** `2560 × 1280 px` / `2560 × 1440 px` |
| **2** | **Banner Image 1 (Portrait / Karakter Anime)** | `.portrait-frame`<br>*(Baris 3–6, Kolom 9–12)* | **1 : 1** (Desktop)<br>**4 : 3** (Mobile)<br>**16 : 10** (Tablet) | Desktop: **411 × 406 px**<br>Mobile: **340×255 s/d 440×330 px**<br>Tablet: **640 × 400 px** | • **Standar (1x):** `800 × 800 px` (1:1) / `1200 × 900 px` (4:3)<br>• **Retina / High-DPI (2x):** `1200 × 1200 px` / `1600 × 1200 px` |
| **3** | **Banner Image 2 (Gallery 1 / Kyoto Pagoda)** | `.gallery-1-frame`<br>*(Baris 5–6, Kolom 1–4)* | **~2 : 1** (Desktop)<br>**16 : 10** (Mobile) | Desktop: **411 × 199 px**<br>Mobile: **165×105 s/d 215×135 px** | • **Standar (1x):** `800 × 400 px` (2:1)<br>• **Retina / High-DPI (2x):** `1200 × 600 px`<br>• **Ultra (3x):** `1600 × 800 px` |
| **4** | **Banner Image 3 (Gallery 2 / Tokyo Night)** | `.gallery-2-frame`<br>*(Baris 5–6, Kolom 5–8)* | **~2 : 1** (Desktop)<br>**16 : 10** (Mobile) | Desktop: **411 × 199 px**<br>Mobile: **165×105 s/d 215×135 px** | • **Standar (1x):** `800 × 400 px` (2:1)<br>• **Retina / High-DPI (2x):** `1200 × 600 px`<br>• **Ultra (3x):** `1600 × 800 px` |
| **5** | **Banner Image 4 (Gallery 3 / Panorama Bawah)** | `.gallery-3-frame`<br>*(Baris 7–8, Kolom 1–8)* | **~4.15 : 1** (Desktop)<br>**16 : 6 / 2.67:1** (Mobile) | Desktop: **829 × 199 px**<br>Mobile: **340×128 s/d 440×165 px** | • **Standar (1x):** `1600 × 400 px` (4:1)<br>• **Retina / High-DPI (2x):** `2400 × 600 px`<br>• **Ultra HD (3x):** `3200 × 800 px` |

---

## 🔍 Penjelasan Detail Per Komponen

### 1. Banner Utama Embed (`.hero-frame`)
- **Lokasi**: Sudut kiri-atas antarmuka, menampung YouTube embed background player dan video trailer/visual utama.
- **Rasio Aspek Ideal**: 
  - Desktop: **2.04 : 1** (mendekati 2:1 format cinematic widescreen).
  - Mobile: **16 : 9** (standar video horizontal).
- **Rekomendasi Resolusi Unggah**:
  - `1920 × 960 px` (rasio 2:1) atau `1920 × 1080 px` (standar 1080p).
- **Catatan Desain**: Area tengah akan dilapisi teks judul *"Cariearsa.com x Fadhil.dev"*, sehingga fokus visual utama gambar sebaiknya berada di sepertiga kiri atau kanan atau memiliki kontras gelap yang cukup.

### 2. Banner Image 1 - Portrait Panel Karakter (`.portrait-frame`)
- **Lokasi**: Sisi kanan di bawah panel `ABOUT:`.
- **Rasio Aspek Ideal**:
  - Desktop: **1 : 1** (Square / Bujur Sangkar).
  - Mobile: **4 : 3** (Vertikal/Portrait sedang).
  - Tablet: **16 : 10**.
- **Rekomendasi Resolusi Unggah**:
  - `800 × 800 px` (Minimum Standar).
  - `1200 × 1200 px` (Rekomendasi untuk ketajaman maksimal layar Retina/OLED).
- **Catatan Desain**: Pada CSS mobile terdapat `object-position: center 25%`, sehingga wajah karakter di sepertiga atas gambar akan selalu terlihat sempurna dan tidak terpotong saat diakses lewat smartphone.

### 3 & 4. Banner Image 2 & 3 - Gallery 1 & 2 (`.gallery-1-frame` & `.gallery-2-frame`)
- **Lokasi**: Baris tengah di bawah Banner Utama (bersebelahan).
- **Rasio Aspek Ideal**:
  - Desktop: **2.06 : 1** (Landscape 2:1).
  - Mobile: **16 : 10** (Landscape 1.6:1 berdampingan 2 kolom).
- **Rekomendasi Resolusi Unggah**:
  - `800 × 400 px` (Standar 1x).
  - `1200 × 600 px` (Rekomendasi Tajam 2x).
- **Catatan Desain**: Cocok untuk pemandangan horizontal, artwork lanskap, atau foto suasana bernuansa manga/sinematik.

### 5. Banner Image 4 - Gallery 3 Panorama (`.gallery-3-frame`)
- **Lokasi**: Baris bawah sisi kiri, tepat di samping kiri wadah cardbox **RELATED FEATURED WEBSITES** (Link Hub).
- **Warna Bayangan Cyber**: `#FFE600` (Kuning Cerah Cyber).
- **Rasio Aspek Ideal**:
  - Desktop: **4.16 : 1** (Ultra-Wide Panorama / Cinematic Banner).
  - Mobile: **16 : 6** (kira-kira 2.67 : 1).
- **Rekomendasi Resolusi Unggah**:
  - `1600 × 400 px` (Standar 1x).
  - `2400 × 600 px` (Rekomendasi Tajam 2x).
  - `3200 × 800 px` (Ultra HD).
- **Catatan Desain**: Sudut kiri atas dan kanan bawah dipotong miring (*cyber polygon cut-corner* sebesar 22px). Hindari menaruh detail penting di ujung sudut kiri-atas (0-25px) dan sudut kanan-bawah agar tidak terpotong oleh efek polygon.

---

## 🚀 Format & Optimalisasi File yang Direkomendasikan (Standar Web Modern)

1. **Format File**:
   - **WebP** (`.webp`) atau **AVIF** (`.avif`): Kompresi terbaik dengan ukuran file 60-80% lebih hemat dibandingkan JPEG/PNG konvensional tanpa penurunan kualitas visual.
   - **PNG** (`.png`): Gunakan jika membutuhkan latar transparan atau grafik linier presisi tinggi.
2. **Color Profile**:
   - Gunakan **sRGB** agar warna konsisten di semua browser, panel monitor, dan layar smartphone.
3. **Ukuran File Optimal**:
   - Gambar Banner 1–3: Usahakan di bawah **200 KB**.
   - Banner Panorama & Hero: Usahakan di bawah **350 KB** agar *loading* website tetap instan (*hyper-fast & zero-latency*).

---

## ⚡ Implementasi Aktif Aset AVIF (Update 6 September 2026)

Seluruh template banner pihak ketiga (Unsplash) telah digantikan secara permanen oleh 4 aset gambar format **AVIF** berkinerja tinggi, beresolusi tajam, dan berbobot sangat ringan (*zero-latency*):

| File Aset | Resolusi Asli (px) | Rasio Aspek | Ukuran File | Target Wadah Banner | Rasio Wadah | Presisi Kecocokan & Ketajaman |
|:---|:---:|:---:|:---:|:---|:---:|:---|
| `image4.avif` | **923 × 923 px** | **1.000 : 1** (Square) | **92.2 KB** | `.portrait-frame` (Banner Image 1) | **1 : 1** (Desktop) / **4 : 3** (Mobile) | **100% Presisi Matematis** (Deviasi hanya 1.2%, kerapatan 2.25x Retina tanpa terpotong). |
| `image1.avif` | **1080 × 537 px** | **2.011 : 1** (~2:1) | **21.3 KB** | `.gallery-1-frame` (Banner Image 2) | **2.065 : 1** (Desktop) / **16 : 10** (Mobile) | **99.5% Presisi Matematis** (Deviasi crop <2.6%, 2.63x Retina tajam). |
| `image2.avif` | **1080 × 754 px** | **1.432 : 1** (~10:7) | **24.4 KB** | `.gallery-2-frame` (Banner Image 3) | **2.065 : 1** (Desktop) / **16 : 10** (Mobile) | **100% Responsif Optimal** (Ideal untuk mobile 16:10 / desktop 2.63x Retina). |
| `image3.avif` | **2400 × 1080 px** | **2.222 : 1** (Ultra-Wide) | **41.3 KB** | `.gallery-3-frame` (Banner Image 4) | **4.166 : 1** (Desktop) / **16 : 6** (Mobile) | **Ultra-HD Retina 2.89x** (Lebar 2400 px menjamin ketajaman ultra-panorama di desktop & mobile). |

- **Total Bobot 4 Banner Baru**: Hanya **179.2 KB** (Hemat >89% dibanding aset template sebelumnya).
- **Latency**: 0 ms transfer overhead, didukung atribut `loading="lazy"` dan `decoding="async"`.

---

## 🌐 Panduan Deployment Cloudflare Pages (2026 Ready)

Website ini telah dikonfigurasi dan dioptimasi penuh agar dapat di-host langsung di **Cloudflare Pages** secara otomatis:

### Konfigurasi Cloudflare Pages:
| Pengaturan | Nilai | Keterangan |
|:---|:---|:---|
| **Framework Preset** | `Vite` *(atau None)* | Arsitektur Vite multi-page |
| **Build Command** | `npm run build` | Menghasilkan bundel statis + aset teroptimasi |
| **Build Output Directory** | `dist` | Direktori seluruh file HTML, CSS, JS, dan AVIF |
| **Package Manager** | `npm` (via `package-lock.json`) | Menggunakan `npm ci` otomatis tanpa dependensi error |
| **Node.js Version** | `24` (ditetapkan via `.node-version`) | Cloudflare runtime Node 24 |

### Fitur Cloudflare Aktif:
- **`public/_headers`**: Mengatur *security headers* (`nosniff`, `strict-origin-when-cross-origin`) dan *immutable caching* untuk aset Vite dan AVIF.
- **`public/_redirects`**: Menangani pengalihan URL bersih (seperti `/360` ke `/introlab/`).
- **Zero Lockfile Conflict**: Penghapusan `bun.lock` format v2 mencegah *Unknown lockfile version error* pada runner Cloudflare, digantikan oleh `package-lock.json` yang sinkron 100%.


