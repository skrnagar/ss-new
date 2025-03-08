"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProfilePhotoModal } from "./profile-photo-modal"

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  name: string
  isOwnProfile: boolean
  onAvatarUpdate?: (url: string) => void
}

export function AvatarUpload({ userId, avatarUrl, name, isOwnProfile, onAvatarUpdate }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(avatarUrl)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Using the existing client instance
  const { toast } = useToast()

  useEffect(() => {
    setAvatarSrc(avatarUrl)
  }, [avatarUrl])

  // Helper function to get initials
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}-${Math.random()}.${fileExt}`

      // Upload the image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const avatar_url = data.publicUrl

      // Update the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      setAvatarSrc(avatar_url)
      if (onAvatarUpdate) {
        onAvatarUpdate(avatar_url)
      }

      toast({
        title: "Success",
        description: "Your profile picture has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error uploading your avatar.",
        variant: "destructive",
      })
      console.error('Error uploading avatar:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      setIsModalOpen(true)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-4">
        <div onClick={handleAvatarClick}>
          <Avatar className={`h-24 w-24 md:h-32 md:w-32 ${isOwnProfile ? 'cursor-pointer' : ''}`}>
            <AvatarImage src={avatarSrc || ''} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
        </div>
        {isOwnProfile && (
          <div className="absolute bottom-0 right-0">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 w-8 rounded-full flex items-center justify-center border-2 border-background">
                <Camera className="h-4 w-4" />
              </div>
              <span className="sr-only">Upload avatar</span>
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={uploadAvatar}
              disabled={uploading}
              className="sr-only"
            />
          </div>
        )}
      </div>

      {isOwnProfile && (
        <ProfilePhotoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userId={userId}
          avatarUrl={avatarSrc}
          name={name}
          onAvatarUpdate={(url) => {
            setAvatarSrc(url)
            if (onAvatarUpdate) onAvatarUpdate(url)
          }}
        />
      )}
    </div>
  )
}