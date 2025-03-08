
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

import { ProfilePhotoModal } from "./profile-photo-modal"

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  name: string
  isOwnProfile: boolean
  onAvatarChange?: (url: string) => void
}

export function AvatarUpload({ userId, avatarUrl, name, isOwnProfile, onAvatarChange }: AvatarUploadProps) {
  const [modalOpen, setModalOpen] = useState(false)
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
      setModalOpen(true)
    }
  }

    try {
      setLoading(true)
      
      // Upload to Supabase Storage directly
      // Use a more specific path format including user ID for better organization
      const timestamp = Date.now()
      const fileName = `${userId}/${timestamp}-${file.name}`
      console.log(`Attempting to upload to avatars bucket: ${fileName}`)
      
      // Check if file is valid
      if (!file || file.size === 0) {
        throw new Error('Invalid file selected')
      }
      
      console.log(`Attempting to upload file to avatars/${fileName}`)
      
      try {
        // Check if file is valid
        if (!file || file.size === 0) {
          throw new Error('Invalid file selected')
        }
        
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type // Explicitly set content type
          })
        
        if (error) {
          console.error('Storage upload error:', error)
          
          // If the error contains "Bucket not found", provide specific guidance
          if (error.message && error.message.includes("not found")) {
            toast({
              title: "Storage configuration issue",
              description: "The avatars storage is not properly configured. Please check Supabase setup.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Upload failed",
              description: error.message || "Could not upload avatar to storage",
              variant: "destructive",
            })
          }
          return
        }
        
        console.log('Upload successful:', data)
      } catch (uploadError: any) {
        console.error('Upload exception:', uploadError)
        toast({
          title: "Upload failed",
          description: uploadError.message || "Could not upload image to storage",
          variant: "destructive",
        })
        return
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      const publicUrl = urlData.publicUrl
      console.log('Generated public URL:', publicUrl)
      
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
      <Avatar 
        className={`h-24 w-24 mb-4 ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''}`} 
        onClick={handleAvatarClick}
      >
        <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      
      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        userId={userId}
        avatarUrl={avatarUrl}
        name={name}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
