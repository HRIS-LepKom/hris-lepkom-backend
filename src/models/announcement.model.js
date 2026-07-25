import mongoose from 'mongoose';

const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    judul: {
      type: String,
      required: true,
      trim: true,
    },
    konten: {
      type: String,
      required: true,
    },
    targetGelombang: {
      type: Number,
      default: null,
    },
    targetTahap: {
      type: String,
      enum: [
        'registrasi',
        'screening',
        'biodata_dokumen',
        'ujian_praktek',
        'ujian_project',
        'keputusan_akhir',
        'selesai',
        null
      ],
      default: null,
    },
    penulisRef: {
      type: Schema.Types.ObjectId,
      ref: 'Asisten',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
