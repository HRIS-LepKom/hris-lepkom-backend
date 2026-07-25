import mongoose from 'mongoose';

const { Schema } = mongoose;

const questionCardSchema = new Schema(
  {
    judulPertanyaan: {
      type: String,
      required: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      trim: true,
      default: null,
    },
    kategori: {
      type: String,
      required: true,
      enum: ['materi', 'teknis', 'kepribadian', 'motivasi'],
    },
    tingkat: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    namaMateri: {
      type: String,
      trim: true,
      default: null,
    },
    dibuatOleh: {
      type: Schema.Types.ObjectId,
      ref: 'Asisten',
      default: null,
    },
  },
  { timestamps: true }
);

const QuestionCard = mongoose.model('QuestionCard', questionCardSchema);

export default QuestionCard;