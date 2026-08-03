import multer from 'multer';

const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = {
  dokumen: ['application/pdf', 'image/jpeg', 'image/png'], 
  // soal ujian & upload hasil ujian praktek
  soal: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ], 
  // PPT/PPTX ujian project
  presentasi: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ], 
  jawaban_praktek: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
  ],
  jawaban_project: [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
};

export const createUploadMiddleware = (tipe, maxSizeMB = 5) => {
  const allowed = ALLOWED_MIME_TYPES[tipe];

  if (!allowed) {
    throw new Error(`Tipe upload tidak dikenal: ${tipe}`);
  }

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!allowed.includes(file.mimetype)) {
        const err = new Error(`Format file tidak didukung untuk ${tipe}`);
        err.statusCode = 400; 
        return cb(err);
      }
      cb(null, true);
    },
  });
};