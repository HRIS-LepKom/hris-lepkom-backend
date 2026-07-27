import mongoose from "mongoose";

const { Schema } = mongoose;

const recruitmentSchema = new Schema(
  {
    gelombangAktif: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keterangan: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true, // as requested: default active when created
    },
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      required: true,
    },
    diaktifkanOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      default: null,
    },
    diaktifkanPada: {
      type: Date,
      default: null,
    },
    dinonaktifkanOleh: {
      type: Schema.Types.ObjectId,
      ref: "Asisten",
      default: null,
    },
    dinonaktifkanPada: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Recruitment = mongoose.model("Recruitment", recruitmentSchema);

export default Recruitment;
