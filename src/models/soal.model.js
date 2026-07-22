import mongoose from "mongoose";

const { Schema } = mongoose;

const soalSchema = new Schema(
  {
    judulSoal: {
      type: String,
      required: true,
      trim: true,
    },
    tingkat: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    file: {
      type: String,
      required: true,
    },
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      default: null,
    },
  },
  { timestamps: true }
);

// Cegah soal duplikat dengan judul & tingkat yang sama
soalSchema.index({ judulSoal: 1, tingkat: 1 }, { unique: true });

const Soal = mongoose.model("Soal", soalSchema);

export default Soal;