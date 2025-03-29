
import { supabase } from './supabase';

export async function uploadMedia(
  bucket: string,
  file: File,
  path: string
) {
  try {
    // Define content type based on file extension
    const contentType = file.type || 'image/jpeg';
    
    // Upload options with correct content type handling
    const fileOptions = {
      contentType,
      cacheControl: '3600',
      upsert: true,
      formData: true
    };

    // Upload directly using the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, fileOptions);

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
