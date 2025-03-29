
import { supabase } from './supabase';

export async function uploadMedia(
  bucket: string,
  file: File,
  path: string
) {
  try {
    // Ensure proper content type is set
    const fileOptions = {
      contentType: file.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: true
    };

    // Convert File to Blob if needed
    const blob = file instanceof Blob ? file : new Blob([file], { type: file.type });

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, blob, fileOptions);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}
