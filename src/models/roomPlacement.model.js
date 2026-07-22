import mongoose from "mongoose";

const { Schema } = mongoose;

const roomPlacementSchema = new Schema(
  {
    examSessionRef: {
      type: Schema.Types.ObjectId,
      ref: "ExamSession",
      required: true,
    },
    ruangan: {
      type: Number,
      required: true,
      enum: [121, 122, 124, 125],
    },
    calasList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Calas",
      },
    ],
    penilaiList: [
      {
        type: Schema.Types.ObjectId,
        ref: "Asisten",
      },
    ],
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      default: null,
    },
  },
  { timestamps: true }
);

// Satu ruangan cuma boleh punya 1 dokumen penempatan per sesi ujian
roomPlacementSchema.index({ examSessionRef: 1, ruangan: 1 }, { unique: true });

const RoomPlacement = mongoose.model("RoomPlacement", roomPlacementSchema);

export default RoomPlacement;