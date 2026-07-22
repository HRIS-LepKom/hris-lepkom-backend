import mongoose from "mongoose";

const { Schema } = mongoose;

const penilaianSchema = new Schema(
  {
    calasRef: {
      type: Schema.Types.ObjectId,
      ref: "Calas",
      required: true,
    },
    penilaiRef: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      required: true,
    },
    examSessionRef: {
      type: Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    jenisUjian: {
      type: String,
      required: true,
      enum: ["praktek", "project"],
    },
    // key kriteria menyesuaikan jenisUjian:
    // praktek -> konsep, eksekusi, analisa, klarifikasi
    // project -> penguasaan, kreativitas, kontribusi, presentasi,
    //            motivasi, interpersonal, integritas, potensi
    kriteria: {
      type: Map,
      of: { type: Number, min: 0, max: 100 },
      required: true,
    },
    deskripsi: {
      type: String,
      trim: true,
      required: true,
    },
    // rata-rata seluruh nilai di `kriteria` — dihitung otomatis, bukan diisi manual
    skorKeseluruhan: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

// 1 penilai cuma boleh submit nilai 1x untuk 1 calas pada 1 jenis ujian yang sama
penilaianSchema.index(
  { calasRef: 1, penilaiRef: 1, jenisUjian: 1 },
  { unique: true }
);

penilaianSchema.pre("save", function (next) {
  const nilaiKriteria = Array.from(this.kriteria.values());
  const total = nilaiKriteria.reduce((sum, n) => sum + n, 0);
  this.skorKeseluruhan = nilaiKriteria.length ? total / nilaiKriteria.length : 0;
  next();
});

const Penilaian = mongoose.model("Penilaian", penilaianSchema);

export default Penilaian;