
"use client"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, Camera, Trash2, X, Frame } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ProfilePhotoModalProps {
  userId: string
  avatarUrl: string | null
  name: string
  isOpen: boolean
  onClose: () => void
}

export function ProfilePhotoModal({ userId, avatarUrl, name, isOpen, onClose }: ProfilePhotoModalProps) {
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
            upsert: false
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
        console.error('Error during file upload:', uploadError)
        toast({
          title: "Upload error",
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
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
      
      // Close modal
      onClose()
      
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
          <h2 className="text-xl font-bold">Profile photo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col items-center">
          <div className="mb-6">
            <Avatar className="h-40 w-40">
              <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center py-6 h-auto"
                onClick={() => handleFileSelect()}
              >
                <Edit className="h-5 w-5 mb-1" />
                <span>Edit</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center py-6 h-auto"
                onClick={() => handleFileSelect()}
              >
                <Camera className="h-5 w-5 mb-1" />
                <span>Add photo</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center py-6 h-auto"
                onClick={handleDeleteAvatar}
                disabled={!avatarUrl || loading}
              >
                <Trash2 className="h-5 w-5 mb-1" />
                <span>Delete</span>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              {loading ? "Processing..." : "Click Edit or Add photo to upload a new image"}
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {/* Visual privacy indicator */}
        <div className="p-4 bg-muted flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-center font-medium">Anyone</span>
          </div>
        </div>
      </div>
    </div>
  )
}
