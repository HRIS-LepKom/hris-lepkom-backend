# Lepkom Recruitment Backend — Developer Guidelines

Dokumen ini adalah referensi teknis paling lengkap dan esensial bagi *maintainer* atau developer penerus yang akan mengelola, mengembangkan, atau memperbaiki codebase backend sistem rekrutmen Lepkom.

Sistem ini dirancang sebagai *legacy app* jangka panjang. Baca dokumen ini dari awal hingga akhir sebelum kamu mulai menulis baris kode pertama, menambahkan modul, middleware, atau fitur baru.

---

## Daftar Isi

1. [Aturan Emas (The Golden Rule)](#1-aturan-emas-the-golden-rule)
2. [Arsitektur Overview](#2-arsitektur-overview)
3. [Request Pipeline (Middleware Chain)](#3-request-pipeline-middleware-chain)
4. [Pola Modul (Routes → Controller → Service)](#4-pola-modul-routes--controller--service)
5. [Sistem Autentikasi & Otorisasi](#5-sistem-autentikasi--otorisasi)
6. [Format Response & Error Handling](#6-format-response--error-handling)
7. [Validasi Input (AJV JSON Schema)](#7-validasi-input-ajv-json-schema)
8. [Database & Model Conventions](#8-database--model-conventions)
9. [Upload & Manajemen File (Supabase)](#9-upload--manajemen-file-supabase)
10. [Utilities Reference](#10-utilities-reference)
11. [Sistem Email (Notifikasi Timeline)](#11-sistem-email-notifikasi-timeline)

---

## 1. Aturan Emas (The Golden Rule)

### 🔴 MAKSIMAL 250 BARIS PER FILE!
Ini adalah aturan paling absolut dalam codebase ini. **Tidak ada satu pun file (kecuali folder `templates/`) yang boleh melebihi 250 baris.**

**Kenapa?** 
File yang terlalu panjang (ribuan baris) sangat sulit di-debug, memusingkan saat dilakukan *code review*, dan memperbesar kemungkinan terjadinya *merge conflict*.

**Solusi:**
Jika *logic* pada *service file* atau *controller* mulai membengkak melampaui 200 baris, pecahlah fungsionalitas tersebut menjadi beberapa file yang lebih spesifik. 
Contoh yang sudah diimplementasikan di proyek ini:
- `roomPlacement.service.js` (Fokus ke manajemen entitas utama RoomPlacement).
- `roomPlacement.members.service.js` (Fokus ke *logic* tambah/hapus peserta/anggota ruangan).
- `management.service.js` (Fokus operasi dasar CRUD).
- `management.timeline.js` (Fokus pada transisi *state* rekrutmen calas).
- `management.export.js` (Fokus pada ekspor data ke Excel).

---

## 2. Arsitektur Overview

Sistem ini mengadopsi **Modul-Based Architecture** (Separation of Concerns).

```text
Request dari Klien (Frontend)
  │
  ▼
app.js             ← Express instance, global middleware, router mounting
  │
  ├── Global Middleware (CORS, express.json(), morgan)
  ├── DB Connection (via mongoose.connect di index.js)
  │
  ▼
Route Handler (src/modules/<nama_modul>/<nama_modul>.routes.js)
  │
  ├── auth.middleware.js         ← Validasi JWT (asistenAuth / calasAuth)
  ├── role.middleware.js         ← Cek hak akses (misal: 'super_admin')
  ├── validate.middleware.js     ← Ajv JSON Schema validation (body/params)
  │
  ▼
Controller (src/modules/<nama_modul>/<nama_modul>.controller.js)
  │ (Hanya untuk ekstrak req.body, panggil Service, & kirim Response)
  ▼
Service (src/modules/<nama_modul>/<nama_modul>.service.js)
  │ (Core business logic, query DB, lempar Error jika gagal)
  ▼
Model (src/models/*.model.js)
  │ (Definisi skema Mongoose, index, virtuals)
  ▼
MongoDB Atlas
```

---

## 3. Request Pipeline (Middleware Chain)

Urutan middleware **SANGAT PENTING**. Jangan menaruh `validate` sebelum `auth` jika route tersebut terproteksi, karena jika tidak terautentikasi, kita sebaiknya langsung menolaknya sebelum membuang CPU _cycles_ untuk validasi skema.

Urutan standar di `routes.js`:
```js
router.post(
  '/',
  asistenAuth,                   // 1. Pastikan token JWT valid dan user aktif
  requireRole('super_admin'),    // 2. Pastikan perannya diizinkan
  validate(createSchema),        // 3. Pastikan format body request sesuai
  createController               // 4. Eksekusi logika
);
```

---

## 4. Pola Modul (Routes → Controller → Service)

Setiap modul bisnis utama harus memiliki foldernya sendiri di `src/modules/` dan berisi 4 tipe file:

### A. routes.js — (Definisi Endpoint & Proteksi)
Jangan pernah menulis logika Mongoose atau bisnis di file ini.

```js
import { Router } from 'express';
import { asistenAuth } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/role.middleware.js';
import validate from '../../middlewares/validate.middleware.js';
import * as schema from './materi.schema.js';
import * as ctrl from './materi.controller.js';

const router = Router();

// GET semua materi (Bisa diakses semua asisten)
router.get('/', asistenAuth, ctrl.getAllMateri);

// POST materi baru (Hanya Super Admin & Koordinator)
router.post(
  '/',
  asistenAuth,
  requireRole('super_admin', 'koordinator_lapangan'),
  validate(schema.createMateriSchema),
  ctrl.createMateri
);

export default router;
```

### B. controller.js — (The Thin Layer)
Controller **wajib** dibungkus oleh `asyncHandler` agar tidak perlu menggunakan `try-catch` berulang-ulang.

```js
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import * as service from './materi.service.js';

export const getAllMateri = asyncHandler(async (req, res) => {
  const result = await service.getAll(req.query);
  sendSuccess(res, result.data, 'Data materi berhasil diambil', 200, result.meta);
});

export const createMateri = asyncHandler(async (req, res) => {
  const materi = await service.create(req.body, req.user._id);
  sendSuccess(res, materi, 'Materi berhasil ditambahkan', 201);
});
```

### C. service.js — (The Brain)
Semua logika bisnis hidup di sini. Jika ada yang salah, *throw Error* dengan menyematkan `statusCode`.

```js
import Materi from '../../../models/materi.model.js';
import { getPaginationParams, buildPaginationMeta } from '../../../utils/paginate.js';

export const getAll = async (query) => {
  const { page, limit, skip } = getPaginationParams(query);
  const filter = {}; // bangun filter di sini

  const [data, total] = await Promise.all([
    Materi.find(filter)
      .populate('dibuatOleh', 'nama idAsisten')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(), // WAJIB .lean() untuk read-only query!
    Materi.countDocuments(filter)
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
};

export const create = async (payload, asistenId) => {
  const isExist = await Materi.findOne({ namaMateri: payload.namaMateri }).lean();
  if (isExist) {
    const err = new Error('Nama materi sudah digunakan');
    err.statusCode = 409;
    throw err;
  }

  const newMateri = await Materi.create({
    ...payload,
    dibuatOleh: asistenId
  });

  return newMateri;
};
```

### D. schema.js — (AJV Validations)
Mencegah NoSQL Injection dan tipe data yang salah.

```js
export const createMateriSchema = {
  type: 'object',
  required: ['namaMateri', 'tingkat'],
  properties: {
    namaMateri: { type: 'string', minLength: 3 },
    tingkat: { type: 'string', enum: ['dasar', 'menengah', 'lanjut'] }
  },
  additionalProperties: false // WAJIB FALSE agar field gaib ditolak
};
```

---

## 5. Sistem Autentikasi & Otorisasi

Aplikasi ini menggunakan JWT (*JSON Web Tokens*).
Ada dua entitas yang bisa login: **Asisten** dan **Calas** (Calon Asisten). Keduanya memiliki *middleware* perlindungan tersendiri.

### `asistenAuth` & `calasAuth` (`middlewares/auth.middleware.js`)
Middleware ini akan:
1. Mengekstrak token dari header `Authorization: Bearer <token>`.
2. Memverifikasi token via `process.env.JWT_SECRET`.
3. Memastikan *record* user masih ada di Database (bukan token lama dari user yang sudah dihapus).
4. Menambahkan objek Mongoose `req.user` (untuk asisten) atau `req.calas` (untuk calas) yang siap digunakan oleh Controller.

### Role-Based Access Control (`middlewares/role.middleware.js`)
Khusus Asisten, Lepkom memiliki tingkat jabatan:
- `super_admin`
- `koordinator_lapangan`
- `pj_ruangan`
- `penilai`

Gunakan `requireRole('super_admin', 'koordinator_lapangan')` di *routes* untuk melindungi *endpoint* dari asisten biasa.

---

## 6. Format Response & Error Handling

Kita **tidak pernah** memanggil `res.json()` atau `res.status()` secara manual. Kita selalu menggunakan _wrapper utils_.

### Response Sukses (`utils/apiResponse.js`)
Fungsi `sendSuccess(res, data, message, statusCode, meta)`.

```json
{
  "status": "success",
  "message": "Data materi berhasil diambil",
  "data": { ... },
  "meta": {
    "totalData": 100,
    "totalPage": 10
  }
}
```

### Response Error
Fungsi `sendError(res, message, statusCode, errors, errorType)`.
Jika kamu menulis `throw err;` dengan `err.statusCode = 404;` di Service, *Global Error Handler* (`middlewares/errorHandler.js`) akan menangkapnya dan memformatnya menjadi:

```json
{
  "status": "error",
  "errorType": "NotFound",
  "message": "Materi tidak ditemukan"
}
```

Error mapping otomatis:
- `400`: BadRequest (termasuk Mongoose ValidationError)
- `401`: Unauthorized (termasuk JsonWebTokenError)
- `403`: Forbidden
- `404`: NotFound
- `409`: Conflict (termasuk MongoError E11000 Duplicate Key)
- `422`: UnprocessableEntity (AJV Schema Error)

---

## 7. Validasi Input (AJV JSON Schema)

AJV adalah *validator* tercepat untuk Node.js. 
Jangan menggunakan Joi, Zod, atau memvalidasi manual di *controller*.

Aturan ketat penulisan schema:
- Selalu gunakan `type: 'object'`.
- Selalu cantumkan `required: [...]` untuk *field* wajib.
- Selalu akhiri schema dengan `additionalProperties: false`. Ini sangat penting untuk menghindari *mass assignment vulnerability* di mana *user* mengirimkan `{"role": "super_admin"}` secara sembunyi-sembunyi pada endpoint *update profile*.

---

## 8. Database & Model Conventions

Backend ini berinteraksi dengan **MongoDB** via **Mongoose ODM**. Ada konvensi ketat yang diterapkan.

### A. Lean Queries (Performance Booster)
Saat kamu memanggil `.find()` atau `.findById()`, Mongoose akan membungkus setiap JSON menjadi *heavy object* (lengkap dengan fungsi `.save()`, _getters_, _setters_). 
Jika kamu hanya butuh membaca data untuk dikirim ke _frontend_, **WAJIB TAMBAHKAN `.lean()`**.
```js
// ✅ BENAR & CEPAT (Plain JS Object)
const data = await Calas.find().lean();

// ❌ SALAH & LAMBAT (Mongoose Object)
const data = await Calas.find(); 
```

### B. MongoDB Transactions (Integritas Data)
Jika sebuah fungsi memutasi (Create, Update, Delete) **lebih dari satu tabel/dokumen** sekaligus, wajib dibungkus dalam *Transaction Session*.
Syarat mutlak: MongoDB harus berjalan sebagai *Replica Set* (contoh: MongoDB Atlas).

```js
import mongoose from 'mongoose';

export const updateDuaTabel = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await TabelA.create([{ nama: 'Test' }], { session });
    await TabelB.findByIdAndUpdate(id, { status: 'aktif' }, { session });
    
    await session.commitTransaction(); // Simpan permanen
    session.endSession();
  } catch (error) {
    await session.abortTransaction(); // Batal, tidak ada data yang masuk setengah-setengah
    session.endSession();
    throw error;
  }
};
```
*Contoh asli dapat dilihat di `management.timeline.js` dan `jawaban.service.js`.*

### C. Aggregation Pipelines (Perhitungan *On-The-Fly*)
Aplikasi ini secara intensif menggunakan `Model.aggregate()` untuk kebutuhan perhitungan dinamis (contoh: Rata-rata Penilaian Calas, Statistik Dashboard Funneling).
Jangan pernah menarik semua data ke memori Node.js via `.find()` lalu meloop-nya dengan `map/reduce` untuk mencari rata-rata. Gunakan tahapan `$match`, `$lookup`, `$group`, dan `$project` agar MongoDB yang melakukan komputasi beratnya.
*Lihat modul `dashboard.service.js`.*

### D. Hard Delete vs Soft Delete
Hindari menghapus data utama secara fisik (`.deleteOne()`) jika data tersebut sudah memiliki relasi historis (misal: Asisten yang pernah melakukan penilaian, atau Room Session yang sudah berlalu). 
Gunakan *flag boolean* `isActive: false` (Soft Delete) jika memungkinkan untuk mencegah *Dangling References*.

---

## 9. Upload & Manajemen File (Supabase)

Lembaga kita menghasilkan banyak file PDF (CV, KRS, Rangkuman Nilai) dan format lain (ZIP Project, Gambar). Menyimpan di server Node.js akan menguras kapasitas _storage_ VPS/Hosting secara cepat.

**Solusi:** Kita *upload* semua dokumen ke Supabase Storage.
1. Klien mengirim *multipart/form-data*.
2. Diterima oleh `upload.middleware.js` (Multer). File divalidasi MIME type-nya dan disalurkan melalui `buffer` (RAM), *bukan disimpan di disk*.
3. Diteruskan ke `uploadToSupabase(file, path)` dari `utils/uploadHelper.js`.
4. Jika Calas mengganti file (update), kita jalankan `deleteFromSupabase(oldUrl)` untuk mencegah *file spam/orphans* di *bucket* Supabase.

*Pastikan mendaftarkan mime-type baru di `ALLOWED_MIME_TYPES` pada `upload.middleware.js` jika ada kebutuhan tipe file baru.*

---

## 10. Utilities Reference

Jangan membuat kode redundan. Gunakan fungsi yang sudah ada:

### Pagination (`utils/paginate.js`)
Mengubah objek `req.query` (`?page=1&limit=10`) menjadi format Mongoose *skip/limit* secara matematis.

```js
const { page, limit, skip } = getPaginationParams(req.query);
const query = Model.find().skip(skip).limit(limit);
const meta = buildPaginationMeta(totalData, page, limit);
```

### Build Smart Filter (`utils/buildSmartFilter.js`)
Membangun MongoDB Filter object dinamis berdasarkan query string. Berguna untuk endpoint admin yang butuh *search* spesifik per kolom.

### Sanitasi Data (`middlewares/xss.middleware.js` & `mongoSanitize`)
Mencegah injeksi kode peretas. Selalu dipanggil di level global `app.js`. Anda tidak perlu memanggilnya lagi secara manual di level *controller*.

---

## 11. Sistem Email (Notifikasi Timeline)

Rekrutmen Lepkom mengandalkan email otomatis saat status Calas berubah (lolos *screening*, diundang ke ujian praktek, pengumuman akhir).

- **Transporter**: Di-handle oleh Nodemailer (`config/mailer.js`).
- **Templating**: Jangan menulis HTML langsung di *service*. Panggil fungsi _template builder_ di folder `templates/timeline/`.
- **Eksekusi**: Di-trigger otomatis oleh `updateTimeline()` pada `calas/management/management.timeline.js`.

**Peringatan Keras:** Jangan mem-*blocking* *response* API hanya untuk menunggu email berhasil terkirim. Gunakan `try-catch` terpisah tanpa `await` di depan *return*, atau setidaknya tidak menggagalkan *request* jika pengiriman email gagal.

---
