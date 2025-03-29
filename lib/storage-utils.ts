
import supabase from './supabase'

export async function uploadMedia(file: File, folder: string = '') {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
  } catch (error) {
    console.error('Error uploading media:', error)
    throw error
  }
}

export async function deleteMedia(path: string) {
  try {
    const { error } = await supabase.storage
      .from('media')
      .remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting media:', error)
    throw error
  }
}
