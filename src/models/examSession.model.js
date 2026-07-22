import mongoose from "mongoose";

const { Schema } = mongoose;

const examSessionSchema = new Schema(
  {
    tanggal: {
      type: Date,
      required: true,
    },
    jenisUjian: {
      type: String,
      required: true,
      enum: ["praktek", "project"],
    },
    catatan: {
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

const ExamSession = mongoose.model("ExamSession", examSessionSchema);

export default ExamSession;