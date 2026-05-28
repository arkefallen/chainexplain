# ChainExplain Backend (Express API & Event-Driven Worker)

ChainExplain adalah platform berbasis microservices/event-driven yang dirancang untuk mengekstrak dan merangkum berkas PDF (terutama Whitepaper Crypto/Web3) menggunakan AI (Gemini Pro API) dengan hasil rangkuman bilingual (Bahasa Indonesia & English) yang disajikan dalam format ELI5 (*Explain Like I'm 5*).

Backend ini terdiri dari dua service utama:
1. **API Service (`src/api`)**: Menerima unggahan file PDF, mengunggah ke storage, menginisialisasi status pekerjaan (Job) di Firestore, serta mempublikasikan pesan pemicu (Job ID) ke Google Cloud Pub/Sub.
2. **Worker Service (`src/worker`)**: Mendengarkan antrean Pub/Sub, mengunduh file PDF dari storage, mengekstrak teks, memotong teks (*recursive chunking*), mengirim potongan teks ke Gemini API untuk diringkas, serta memperbarui progres ringkasan ke Firestore secara asinkron.

---

## 🛠️ Tech Stack & Dependencies

- **Runtime**: Node.js v22 (LTS)
- **Framework**: Express.js v5 (routing, rate limiting, helmet security)
- **Database (NoSQL)**: Firestore (menyimpan metadata pekerjaan, progres, dan hasil ringkasan)
- **Event Queue / Messaging**: Google Cloud Pub/Sub (mengoordinasikan komunikasi asinkron antara API dan Worker)
- **Object Storage**: MinIO (development lokal) / Google Cloud Storage (production)
- **AI SDK**: Google Generative AI SDK (`@google/generative-ai` dengan model `gemini-pro`)
- **PDF Parser**: `pdf-parse` (ekstraksi teks dari PDF)

---

## 📂 Struktur Direktori

```text
chainexplain-be/
├── src/
│   ├── env.js                      # Centralized environment loader (.env vs .env.dev)
│   ├── index.js                    # Entrypoint API Service
│   ├── api/                        # API Service logic
│   │   ├── controllers/            # Controller endpoints (upload, status)
│   │   ├── middleware/             # Express middlewares (multer, rate limiter, error)
│   │   ├── routes/                 # API routes mapping
│   │   └── validators/             # Manual schema & type validators
│   ├── worker/                     # Worker Service logic
│   │   ├── index.js                # Entrypoint Worker Service
│   │   └── subscriber.js           # Pub/Sub client & message processing orchestration
│   └── shared/                     # Modul bersama (config & utility)
│       ├── config/                 # Inisialisasi Firebase, Pub/Sub, Storage
│       ├── models/                 # Model/Helper Firestore CRUD (job.model)
│       └── utils/                  # Structured logger utility
├── Dockerfile.api                  # Spec container API Service
├── Dockerfile.worker               # Spec container Worker Service
├── Dockerfile.emulator             # Spec container Firebase Local Emulator (Java 21 JRE)
├── docker-compose.yml              # Orkestrasi multi-container stack lokal
├── firebase.json                   # Konfigurasi port Firebase Emulator Suite
└── firestore.rules                 # Security rules Firestore (open untuk development)
```

---

## 🚀 Panduan Setup & Eksekusi di Local Development

Dalam pengembangan lokal, seluruh *environment* (API, Worker, Firebase Emulator, MinIO Storage) dijalankan di dalam container Docker agar tidak memerlukan instalasi manual Java SDK, Firebase CLI, Google Cloud SDK, atau konfigurasi eksternal lainnya.

### 1. Prasyarat Lokal
Pastikan Anda sudah menginstal:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (dengan WSL2 backend jika di Windows)
- Node.js v22+ & npm (jika ingin menjalankan di luar Docker secara manual)

### 2. Konfigurasi Environment (`.env.dev`)
Pastikan file `.env.dev` telah dikonfigurasi di root folder `chainexplain-be/` dengan format berikut:

```env
PORT=3000
NODE_ENV=development

# Storage Settings (Menggunakan MinIO Lokal)
STORAGE_TYPE=minio
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
STORAGE_BUCKET=chainexplain-uploads

# GCP / Firebase (Menggunakan Emulator Lokal)
GCP_PROJECT_ID=JuaraVibeCoding
FIRESTORE_EMULATOR_HOST=firebase-emulator:8080
PUBSUB_EMULATOR_HOST=firebase-emulator:8085
PUBSUB_TOPIC_ID=chainexplain-jobs

# Gemini AI (Wajib diisi dengan API Key valid Anda)
GEMINI_API_KEY=AIzaSy...yourKeyHere...
```

### 3. Cara Menjalankan Stack dengan Docker Compose
Jalankan perintah berikut untuk mengunduh dependencies, membangun container image, dan menyalakan semua service:

```powershell
# Menyalakan seluruh stack (MinIO + Firebase Emulator + API + Worker)
docker compose --env-file .env.dev up --build
```

Setelah seluruh service berjalan sukses:
- **API Service**: Berjalan di `http://localhost:3000`
- **Firebase Emulator UI**: Diakses di `http://localhost:4000` (untuk memantau Firestore & data Pub/Sub)
- **MinIO Console**: Diakses di `http://localhost:9001` (Username: `minioadmin`, Password: `minioadmin`)

### 4. Perintah Tambahan Docker yang Berguna
```powershell
# Menghentikan seluruh container stack
docker compose down

# Hanya me-rebuild dan merestart service API & Worker tanpa mematikan emulator
docker compose --env-file .env.dev up --build api worker

# Membersihkan cache build Docker jika terjadi masalah caching layer
docker compose build --no-cache
```

---

## 🌐 Panduan Setup & Deployment ke Production

Untuk lingkungan production, API dan Worker biasanya dideploy ke cloud platform (seperti Google Cloud Run / AWS ECS) dan terhubung langsung ke layanan cloud terkelola seperti Google Cloud Firestore (Native Mode), Google Cloud Pub/Sub, dan Google Cloud Storage.

### 1. Konfigurasi Environment Production (`.env`)
Buat file bernama `.env` di root folder `chainexplain-be/`:

```env
PORT=8080
NODE_ENV=production

# Storage Settings (Menggunakan Google Cloud Storage)
STORAGE_TYPE=cloud_storage
STORAGE_BUCKET=chainexplain-prod-bucket

# GCP / Firebase (Koneksi Langsung GCP Services)
GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
PUBSUB_TOPIC_ID=chainexplain-jobs-prod

# Gemini AI
GEMINI_API_KEY=AIzaSy...productionKey...
```

> [!IMPORTANT]
> Masukkan file kredensial `serviceAccountKey.json` asli milik service account GCP Anda di root folder sebelum membangun image production.

### 2. Membangun & Menjalankan Kontainer Production
Anda dapat membangun image secara manual menggunakan Dockerfile yang disiapkan:

```bash
# Build API Service Image
docker build -t gcr.io/your-project/chainexplain-api:latest -f Dockerfile.api .

# Build Worker Service Image
docker build -t gcr.io/your-project/chainexplain-worker:latest -f Dockerfile.worker .
```

Jalankan API secara mandiri di production:
```bash
docker run -p 8080:8080 --env-file .env -v $(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json gcr.io/your-project/chainexplain-api:latest
```

---

## 📖 Dokumentasi Endpoint API

API Service berjalan di base path `/api`. Semua respons JSON mengikuti struktur standar `{ success: boolean, data?: any, error?: string }`.

### 1. Health Check
Mengecek status kesehatan server API.
- **URL**: `/api/health`
- **Method**: `GET`
- **Auth**: None
- **Headers**: None
- **Response (200 OK)**:
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. Upload PDF
Mengunggah file PDF untuk diproses dan diringkas oleh Worker.
- **URL**: `/api/upload`
- **Method**: `POST`
- **Auth**: None
- **Content-Type**: `multipart/form-data`
- **Request Body (form-data)**:
  - `file` (File, wajib): Berkas dokumen berformat PDF (maksimal **10 MB**).
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "jobId": "a9b8c7d6-e5f4-3210-9876-543210fedcba",
      "status": "PENDING",
      "fileName": "bitcoin_whitepaper.pdf"
    }
  }
  ```
- **Error Response (400 Bad Request - Jika file bukan PDF atau >10MB)**:
  ```json
  {
    "success": false,
    "error": "Only PDF files are allowed"
  }
  ```

---

### 3. Get Job Status & Summary
Mengambil progres pemrosesan dokumen dan hasil ringkasan ELI5 bilingual setelah selesai.
- **URL**: `/api/jobs/:jobId`
- **Method**: `GET`
- **Auth**: None
- **URL Parameters**:
  - `jobId` (String, wajib): ID pekerjaan unik yang didapatkan dari response API Upload.
- **Response (200 OK - Pemrosesan Selesai)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "a9b8c7d6-e5f4-3210-9876-543210fedcba",
      "status": "COMPLETED",
      "progress": 100,
      "summaryId": "# Ringkasan Eksekutif (ELI5)\n\nBitcoin adalah uang digital yang...",
      "summaryEn": "# Executive Summary (ELI5)\n\nBitcoin is a digital cash system that...",
      "fileName": "bitcoin_whitepaper.pdf",
      "createdAt": "2026-05-21T03:30:15.123Z"
    }
  }
  ```
- **Response (200 OK - Pemrosesan Masih Berjalan)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "a9b8c7d6-e5f4-3210-9876-543210fedcba",
      "status": "PROCESSING",
      "progress": 45,
      "summaryId": null,
      "summaryEn": null,
      "fileName": "bitcoin_whitepaper.pdf",
      "createdAt": "2026-05-21T03:30:15.123Z"
    }
  }
  ```
- **Error Response (404 Not Found - Jika Job ID tidak ada di Firestore)**:
  ```json
  {
    "success": false,
    "error": "Job not found"
  }
  ```

---

## 📬 Panduan Pengujian Menggunakan Postman (PDF Upload Guide)

Untuk menguji API upload PDF di Postman, ikuti instruksi konfigurasi detail di bawah ini agar tipe data berkas terkirim secara tepat:

### Langkah 1: Setup Request
1. Buka aplikasi **Postman** Anda.
2. Buat tab request baru dengan mengeklik ikon **`+`** (New Request).
3. Ubah dropdown HTTP Method menjadi **`POST`**.
4. Masukkan URL endpoint API upload Anda:
   ```text
   http://localhost:3000/api/upload
   ```

### Langkah 2: Setup Body & Form-Data
1. Di bawah kolom input URL, klik tab **`Body`**.
2. Pilih opsi radio button **`form-data`**.

### Langkah 3: Mengonfigurasi Key & Memilih Berkas PDF (Value)
Ini adalah langkah paling krusial agar Postman mengirimkan berkas asli, bukan sekadar string teks biasa:

1. Di kolom **`Key`**, ketik nama field yang diharapkan oleh backend, yaitu: **`file`**.
2. Arahkan kursor Anda ke ujung kanan kolom input **`Key`** (pada baris yang baru saja Anda isi).
3. Anda akan melihat sebuah menu dropdown bertuliskan **`Text`**. Klik dropdown tersebut dan ubah tipenya menjadi **`File`**.
4. Setelah tipe diubah menjadi **`File`**, kolom **`Value`** di baris tersebut secara otomatis akan berubah menjadi sebuah tombol bertuliskan **`Select Files`** (atau *Choose Files*).
5. Klik tombol **`Select Files`**, lalu telusuri explorer komputer Anda dan pilih dokumen PDF yang ingin Anda rangkum (pastikan berkas PDF Anda berukuran **di bawah 10 MB**).

![Postman Setup Guide Placeholder](https://res.cloudinary.com/postman/image/upload/v1625828456/user-docs/form-data-file-type.png) *(Ilustrasi pemilihan tipe berkas di Postman)*

### Langkah 4: Kirim Request
1. Klik tombol **`Send`** berwarna biru di pojok kanan atas.
2. Jika server lokal Anda berjalan lancar, Anda akan langsung menerima status kode `201 Created` dengan muatan body respons JSON yang berisi `jobId` unik.
3. Salin `jobId` tersebut, lalu buat request `GET` ke `http://localhost:3000/api/jobs/{jobId}` di tab Postman baru untuk melacak kemajuan ringkasan PDF Anda secara real-time!
