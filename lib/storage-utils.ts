
import { supabase } from './supabase';

export async function uploadMedia(
  bucket: string,
  file: File,
  path: string
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}
