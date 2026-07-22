import mongoose from "mongoose";

const { Schema } = mongoose;

const hardResetRequestSchema = new Schema(
  {
    asistenRef: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      required: true,
    },
    // ID asisten atau email yang diketik saat request diajukan — buat audit trail
    inputAwal: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["menunggu", "disetujui", "ditolak"],
      default: "menunggu",
    },
    disetujuiOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten", // super admin yang approve/reject
      default: null,
    },
    diprosesPada: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const HardResetRequest = mongoose.model("HardResetRequest", hardResetRequestSchema);

export default HardResetRequest;