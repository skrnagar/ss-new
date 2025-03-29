
import { supabase } from './supabase';

export async function uploadMedia(
  bucket: string,
  file: File,
  path: string
) {
  try {
    // Convert file to ArrayBuffer to preserve binary data
    const arrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([arrayBuffer], { type: file.type });

    // Upload options with correct content type handling
    const fileOptions = {
      contentType: file.type || 'image/jpeg',
      cacheControl: '3600',
      upsert: true
    };

    // Upload blob directly
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBlob, fileOptions);

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}
