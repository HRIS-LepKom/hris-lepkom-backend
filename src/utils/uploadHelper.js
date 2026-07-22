import { randomUUID } from 'crypto';
import supabase from '../config/supabase.js';

const BUCKET_NAME = process.env.SUPABASE_BUCKET; 

export const uploadToSupabase = async (file, folder) => {
  const ext = file.originalname.split('.').pop();
  const path = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    const err = new Error(`Gagal upload file ke storage: ${error.message}`);
    err.statusCode = 502;
    throw err;
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return data.publicUrl;
};

export const deleteFromSupabase = async (fileUrl) => {
  if (!fileUrl) return;

  const path = fileUrl.split(`/${BUCKET_NAME}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    console.error(`Gagal hapus file lama dari storage: ${error.message}`);
  }
};