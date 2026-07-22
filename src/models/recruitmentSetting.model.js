import mongoose from "mongoose";

const { Schema } = mongoose;

const recruitmentSettingSchema = new Schema(
  {
    // field kunci tetap, dibuat unique — supaya cuma boleh ada 1 dokumen (singleton)
    key: {
      type: String,
      default: "recruitment_setting",
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    // dipakai buat ngisi otomatis field gelombangDaftar saat calas baru daftar
    gelombangAktif: {
      type: String,
      default: null,
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

const RecruitmentSetting = mongoose.model("RecruitmentSetting", recruitmentSettingSchema);

export default RecruitmentSetting;