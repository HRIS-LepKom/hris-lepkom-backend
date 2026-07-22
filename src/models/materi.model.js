import mongoose from "mongoose";

const { Schema } = mongoose;

const materiSchema = new Schema(
  {
    namaMateri: {
      type: String,
      required: true,
      trim: true,
    },
    tingkat: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    deskripsi: {
      type: String,
      trim: true,
      default: null,
    },
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      default: null,
    },
  },
  { timestamps: true }
);

// Cegah materi duplikat dengan nama & tingkat yang sama
materiSchema.index({ namaMateri: 1, tingkat: 1 }, { unique: true });

const Materi = mongoose.model("Materi", materiSchema);

export default Materi;