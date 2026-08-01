import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const calasSchema = new Schema(
  {
    idCalas: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gelombangDaftar: {
      type: String,
      trim: true,
    },
    npm: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    namaCalas: {
      type: String,
      required: true,
      trim: true,
    },
    kelas: {
      type: String,
      required: true,
      trim: true,
    },
    jenisKelamin: {
      type: String,
      required: true,
      enum: ["L", "P"],
    },
    noKtp: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    noHp: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emailCalas: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    tempatLahir: {
      type: String,
      required: true,
      trim: true,
    },
    tanggalLahir: {
      type: String,
      required: true,
      trim: true,
    },
    alamatLengkap: {
      type: String,
      required: true,
      trim: true,
    },
    asalSekolah: {
      type: String,
      required: true,
      trim: true,
    },
    wilayah: {
      type: String,
      trim: true,
    },
    jurusan: {
      type: String,
      required: true,
      trim: true,
    },
    ipk: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    namaIbu: {
      type: String,
      trim: true,
    },
    namaAyah: {
      type: String,
      trim: true,
    },
    noHpOrtu: {
      type: String,
      required: true,
      trim: true,
    },

    kursusSemester: {
      semester1: { type: String, default: null },
      semester2: { type: String, default: null },
      semester3: { type: String, default: null },
      semester4: { type: String, default: null },
      semester5: { type: String, default: null },
      semester6: { type: String, default: null },
      semester7: { type: String, default: null },
    },

    isKursusDelete: {
      type: Boolean,
      default: false,
    },

    SemesterKursusDel: {
      type: String,
      trim: true,
    },

    kemampuanPribadi: {
      type: String,
      trim: true,
    },
    kemampuanIt: {
      type: String,
      trim: true,
    },
    pengalamanOrganisasi: {
      type: String,
      trim: true,
    },
    pengalamanKerja: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, 
    },

    daftarVia: {
      type: String,
      enum: ["mandiri", "asisten"],
      required: true,
      default: "mandiri",
    },
    didaftarkanOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      default: null,
    },
    wajibGantiPassword: {
      type: Boolean,
      default: false,
    },
    isBiodataEmailSending: {
      type: Boolean,
      default: true,
    },

    cv: {
      type: String,
      default: null,
    },
    krs: {
      type: String,
      default: null,
    },
    rangkumanNilai: {
      type: String,
      default: null,
    },
    jawabanPraktek: {
      type: String,
      default: null,
    },
    jawabanProject: {
      type: String,
      default: null,
    },

    statusRekrutmen: {
      tahapSaatIni: {
        type: String,
        enum: [
          "registrasi",
          "screening",
          "biodata_dokumen",
          "ujian_praktek",
          "ujian_project",
          "keputusan_akhir",
          "selesai",
        ],
        default: "registrasi",
      },
      hasil: {
        type: String,
        enum: ["proses", "lolos", "tidak_lolos"],
        default: "proses",
      },
      alasanTidakLolos: {
        type: String,
        enum: [
          "tidak_lolos_screening",
          "tidak_hadir_ujian",
          "tidak_lolos_penilaian",
          "ditolak_rapat_akhir",
          "lainnya",
        ],
        default: null,
      },
      deskripsiPenolakan: {
        type: String,
        trim: true,
        default: null,
      },
    },

    isBanned: {
      type: Boolean,
      default: false,
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

calasSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

calasSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Calas = mongoose.model("Calas", calasSchema);

export default Calas;