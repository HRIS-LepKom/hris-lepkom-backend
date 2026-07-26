import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

export const ASISTEN_ROLES = [
  "super_admin",
  "pj_soal_materi",
  "penanggung_jawab_ruangan",
  "koordinator_lapangan",
  "asisten_penilai",
  "asisten",
  "staff"
];

const asistenSchema = new Schema(
  {
    idAsisten: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    npm: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    kelasSaatIni: {
      type: String,
      trim: true,
      default: null,
    },

    // Nullable dengan sengaja: asisten lama hasil migrasi atau hasil konversi dari calas yang baru lolos bisa saja belum diberi role sampai super admin menetapkannya (saat toggle rekrutmen aktif).
    role: {
      type: String,
      enum: ASISTEN_ROLES,
      default: "asisten",
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    // Di-set true oleh super admin saat approve permintaan hard reset password; dipakai untuk memaksa asisten ganti password dulu sebelum masuk dashboard pada login berikutnya.
    wajibGantiPassword: {
      type: Boolean,
      default: false,
    },

    // Terisi jika akun ini adalah hasil konversi dari seorang calas yang dinyatakan lolos.
    calasRef: {
      type: Schema.Types.ObjectId,
      ref: "Calas",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

asistenSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

asistenSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Asisten = mongoose.model("Asisten", asistenSchema);

export default Asisten;