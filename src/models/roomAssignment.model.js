import mongoose from "mongoose";

const { Schema } = mongoose;

const roomAssignmentSchema = new Schema(
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
    pjRuanganRef: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
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

// Satu ruangan cuma boleh punya 1 PJ per sesi ujian
roomAssignmentSchema.index({ examSessionRef: 1, ruangan: 1 }, { unique: true });

const RoomAssignment = mongoose.model("RoomAssignment", roomAssignmentSchema);

export default RoomAssignment;