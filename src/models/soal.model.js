import mongoose from 'mongoose';

const { Schema } = mongoose;

const soalSchema = new Schema(
  {
    judulSoal: {
      type: String,
      required: true,
      trim: true,
    },
    materiRef: {
      type: Schema.Types.ObjectId,
      ref: 'Materi',
      required: true,
    },
    tingkat: {
      type: Number,
      enum: [1, 2, 3],
      required: true,
    },
    file: {
      type: String,
      default: null,
    },
    // false = hanya pj_soal_materi & super_admin yang bisa lihat
    // true  = semua asisten & calas bisa lihat dan download
    isViewed: {
      type: Boolean,
      default: false,
    },
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: 'Asisten',
      default: null,
    },
  },
  { timestamps: true }
);

// Cegah soal duplikat dengan judul yang sama pada materi yang sama
soalSchema.index({ judulSoal: 1, materiRef: 1 }, { unique: true });

const Soal = mongoose.model('Soal', soalSchema);

export default Soal;