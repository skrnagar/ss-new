"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { X, Camera, Edit, Trash2, Image } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ProfilePhotoModalProps {
  userId: string
  avatarUrl: string | null
  name: string
  isOpen: boolean
  onClose: () => void
  onAvatarChange?: (url: string) => void
}

export function ProfilePhotoModal({ userId, avatarUrl, name, isOpen, onClose, onAvatarChange }: ProfilePhotoModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState(name || '')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Handle file change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)
      const file = event.target.files?.[0]

      if (!file) {
        throw new Error('No file selected')
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file selected')
      }

      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(data.path)

      const url = urlData.publicUrl

      // Update profile with new avatar URL and full name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          avatar_url: url,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (profileError) throw profileError

      toast({
        title: "Profile updated",
        description: "Your profile photo and information have been updated successfully",
      })

      // Call the onAvatarChange callback if provided
      if (onAvatarChange) {
        onAvatarChange(url)
      }

      onClose()
      router.refresh()

    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle avatar deletion
  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return

    try {
      setLoading(true)

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)

      if (updateError) {
        console.error('Profile update error:', updateError)
        throw updateError
      }

      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      })

      // Close modal
      onClose()

      // Refresh the page
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error removing avatar",
        description: error.message || "Failed to remove avatar",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-background rounded-lg shadow-lg max-w-md w-full overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Update Profile</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col items-center">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <div className="mb-6">
            <Avatar className="h-40 w-40">
              <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={fullName} />
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="w-full">
            <div className="grid gap-4 py-4">
              <div className="flex justify-center">
                {preview ? (
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={preview} alt="Preview" />
                    <AvatarFallback>{fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={fullName} />
                    <AvatarFallback>{fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium leading-6 mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="mb-4"
                />
              </div>
              <div>
                <label htmlFor="photo" className="block text-sm font-medium leading-6 mb-2">
                  Photo
                </label>
                <div className="flex items-center gap-x-3">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="text-center mt-2 text-sm text-muted-foreground">
              {loading ? "Uploading..." : "Photo helps people recognize you"}
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleFileChange}
                disabled={loading}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}