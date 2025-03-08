
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  name: string
  isOwnProfile: boolean
  onAvatarChange?: (url: string) => void
}

export function AvatarUpload({ userId, avatarUrl, name, isOwnProfile, onAvatarChange }: AvatarUploadProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      // Check if the avatars bucket exists
      const { error: bucketError } = await supabase.storage.getBucket('avatars')
      if (bucketError) {
        console.error('Bucket error:', bucketError)
        toast({
          title: "Storage error",
          description: "Avatar storage is not configured correctly. Please contact support.",
          variant: "destructive",
        })
        return
      }
      
      // Upload to Supabase Storage
      const fileName = `avatar-${userId}-${Date.now()}`
      console.log(`Attempting to upload to avatars bucket: ${fileName}`)
      
      // Check if file is valid
      if (!file || file.size === 0) {
        throw new Error('Invalid file selected')
      }
      
      try {
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type // Explicitly set content type
          })
        
        if (error) {
          console.error('Storage upload error:', error)
          throw error
        }
        
        console.log('Upload successful:', data)
      } catch (uploadError: any) {
        console.error('Upload exception:', uploadError)
        toast({
          title: "Upload failed",
          description: uploadError.message || "Could not upload image to storage",
          variant: "destructive",
        })
        throw uploadError
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // Update user profile with new avatar URL
      console.log(`Updating profile ${userId} with new avatar URL: ${publicUrl}`)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
      
      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }
      
      console.log('Profile updated successfully')
      
      // Call the callback to update UI
      if (onAvatarChange) {
        onAvatarChange(publicUrl)
      }

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
      
      // Refresh the page to show the updated avatar
      router.refresh()
      
    } catch (error: any) {
      toast({
        title: "Error updating avatar",
        description: error.message || "Failed to update avatar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <Avatar 
        className={`h-24 w-24 mb-4 ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''}`} 
        onClick={handleAvatarClick}
      >
        <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      
      {isOwnProfile && loading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}
    </>
  )
}
