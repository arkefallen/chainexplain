# ChainExplain — UI/UX Design Specification

> Dokumen ini berisi Sitemap dan User Stories yang disiapkan khusus untuk di-generate menjadi desain UI di Google Stitch. Semua instruksi di bawah sudah disesuaikan dengan Design System pada MVP Plan.

---

## 🎨 Design System Guide (Untuk Google Stitch)

Berikan instruksi design system ini ke prompt Google Stitch agar hasil generate selaras dengan rencana MVP:

**Color Palette & Theme Mode Support:**

The application features a fully cohesive Dual-Theme System (Light Mode and Dark Mode) with a fluid, spring-animated transition.

*   **Dark Mode Palette (Base Vibe):**
    - **Primary:** `#6366f1` (Indigo 500) - Main CTA & highlighted features.
    - **Secondary:** `#8b5cf6` (Violet 500) - Secondary accents & gradient styling.
    - **Accent:** `#06b6d4` (Cyan 500) - Success status badges & micro-actions.
    - **Background:** `#0f172a` (Slate 900) - Rich deep-slate backdrop.
    - **Surface/Card:** `#1e293b` (Slate 800) - Embedded cards & container backgrounds.
    - **Text Primary:** `#f8fafc` (Slate 50) - Crisp primary text contrast.
    - **Text Secondary:** `#94a3b8` (Slate 400) - Muted subtitles & labels.
    - **Border:** `#334155` (Slate 700) - Soft structural divider line.

*   **Light Mode Palette (Complementary Vibe):**
    - **Primary:** `#4f46e5` (Indigo 600) - Rich Indigo for light-theme high-contrast CTAs.
    - **Secondary:** `#7c3aed` (Violet 600) - Vibrant Violet accents.
    - **Accent:** `#0891b2` (Cyan 600) - Muted Teal-Cyan success indicators.
    - **Background:** `#f8fafc` (Slate 50) - Soft off-white backdrop.
    - **Surface/Card:** `#ffffff` (White) - Pure white card containers.
    - **Text Primary:** `#0f172a` (Slate 900) - Rich dark primary text.
    - **Text Secondary:** `#475569` (Slate 600) - Gray-slate subtitle text.
    - **Border:** `#e2e8f0` (Slate 200) - Clean grey structural divider line.

**Typography & Styling:**
- **Font Family:** `Inter`, sans-serif. Modern, clean, dan mudah dibaca.
- **Border Radius:** `12px` untuk Card dan Container besar, `8px` untuk Button dan Input.
- **Vibe:** Modern Web3, Glassmorphism ringan pada Navbar, Clean layout dengan banyak white-space.

---

## 🗺️ Sitemap

Struktur halaman web aplikasi ChainExplain:

1. **Home Page (`/`)**
   - Hero Section (Headline, Subheadline, Primary CTA "Start Explaining")
   - Feature Highlights (3 kolom: Fast, ELI5 Simplicity, Bilingual)
   - Footer sederhana

2. **Upload Page (`/upload`)**
   - Header/Navbar dengan Logo
   - Main Container: Drag & Drop Zone untuk file PDF
   - File Preview Section (muncul setelah file dipilih, menampilkan nama & ukuran file)
   - Action Button: "Generate ELI5 Summary"

3. **Processing Page (`/processing`)**
   - Header/Navbar dengan Logo
   - Animated Progress State
   - Step Indicators (Uploading → Extracting → Summarizing)
   - Loading Skeleton/Spinner dengan teks lucu ("Membaca bahasa alien...", "Membuat analogi untuk anak 5 tahun...")

4. **Result Page (`/result`)**
   - Header/Navbar dengan Logo
   - Action Bar: Language Toggle (ID / EN) & Copy Button
   - Main Summary Card (Menampilkan hasil ELI5 secara keseluruhan)
   - Chunk Accordion (Opsional untuk melihat summary per bagian whitepaper)
   - Button "Upload Another Whitepaper"

5. **Error State / Toast Notifications**
   - Toast Error (File terlalu besar, format salah)
   - Error Page/Card (Gagal memproses, koneksi terputus) + Button "Retry"

---

## 👤 User Stories

Gunakan User Stories ini di Google Stitch untuk memandu pembuatan flow dan interaksi tiap halaman:

### 1. Home Page Experience
- **Sebagai pengguna**, saya ingin melihat landing page yang modern dengan background bernuansa dark-mode web3, sehingga saya langsung mengerti bahwa platform ini berkaitan dengan crypto dan AI.
- **Sebagai pengguna**, saya ingin melihat tombol Call-to-Action (CTA) yang mencolok agar saya tahu harus mengklik apa untuk mulai mengupload dokumen.

### 2. Upload Experience
- **Sebagai pengguna**, saya ingin halaman upload memiliki area *Drag & Drop* yang besar dan interaktif (berubah warna/border saat file di-drag), agar mudah mengunggah file whitepaper PDF dari laptop.
- **Sebagai pengguna**, setelah memilih file, saya ingin melihat preview nama dan ukuran file, serta tombol batal (X), untuk memastikan file yang akan diproses sudah benar.
- **Sebagai pengguna**, saya ingin diberi peringatan visual (merah/error text) jika file yang saya pilih bukan PDF atau ukurannya melebihi 10MB.

### 3. Processing Feedback
- **Sebagai pengguna**, saat file sedang diproses, saya ingin melihat indikator progres (progress bar) dan status langkah yang sedang berjalan (Uploading, Extracting, Summarizing), agar saya tahu sistem tidak *hang* dan sedang bekerja.

### 4. Reading Results (Core Flow)
- **Sebagai pengguna**, setelah proses selesai, saya ingin langsung melihat hasil rangkuman ELI5 di dalam sebuah *Card* yang bersih dan mudah dibaca.
- **Sebagai pengguna**, saya ingin bisa mengubah bahasa rangkuman antara Bahasa Indonesia dan Bahasa Inggris menggunakan sebuah tombol *Toggle* yang intuitif di atas hasil teks.
- **Sebagai pengguna**, saya ingin bisa menyalin teks rangkuman dengan satu klik melalui tombol "Copy to Clipboard", yang memberikan feedback "Copied!" setelah diklik.
- **Sebagai pengguna**, jika saya ingin melihat detail spesifik, saya ingin bisa membuka *Accordion* di bawah rangkuman utama yang memecah penjelasan per bagian (chunk) dari whitepaper.

### 5. Error Handling
- **Sebagai pengguna**, jika terjadi kegagalan (misal API timeout atau koneksi putus), saya ingin melihat pesan error yang jelas dan ramah, beserta tombol "Coba Lagi" (*Retry*), agar saya bisa mencoba kembali tanpa harus memulai dari awal halaman Home.
