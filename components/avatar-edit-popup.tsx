
"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Camera, Upload, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AvatarEditPopupProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  currentAvatarUrl: string | null
  userId: string
  userName: string
  onAvatarChange: (url: string) => void
}

export function AvatarEditPopup({
  isOpen,
  setIsOpen,
  currentAvatarUrl,
  userId,
  userName,
  onAvatarChange
}: AvatarEditPopupProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [tempImageFile, setTempImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      })
      return
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }
    
    setTempImageFile(file)
    const imageUrl = URL.createObjectURL(file)
    setSelectedImage(imageUrl)
  }
  
  const removeImage = () => {
    setSelectedImage(null)
    setTempImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const uploadAvatar = async () => {
    if (!tempImageFile) return
    
    setIsUploading(true)
    
    try {
      // Create a unique file name
      const fileExt = tempImageFile.name.split('.').pop()
      const fileName = `${userId}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `avatars/${fileName}`
      
      // Upload to storage
      const { error: uploadError } = await supabase
        .storage
        .from('profiles')
        .upload(filePath, tempImageFile)
        
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('profiles')
        .getPublicUrl(filePath)
      
      // Update avatar URL in profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        
      if (updateError) throw updateError
      
      // Call the callback with the new URL
      onAvatarChange(publicUrl)
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully",
      })
      
      // Close the popup
      setIsOpen(false)
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setSelectedImage(null)
      setTempImageFile(null)
    }
  }
  
  const removeAvatar = async () => {
    if (!currentAvatarUrl) return
    
    setIsUploading(true)
    
    try {
      // Update profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId)
        
      if (updateError) throw updateError
      
      // Call the callback with empty URL
      onAvatarChange('')
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed",
      })
      
      // Close the popup
      setIsOpen(false)
    } catch (error: any) {
      toast({
        title: "Error removing avatar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update profile picture</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
          
          {selectedImage ? (
            <div className="relative">
              <img 
                src={selectedImage} 
                alt="Preview" 
                className="w-32 h-32 rounded-full object-cover" 
              />
              <button 
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <Avatar className="w-32 h-32">
              <AvatarImage src={currentAvatarUrl || "/placeholder-user.jpg"} alt={userName} />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Button 
              variant="outline" 
              onClick={triggerFileSelect} 
              disabled={isUploading}
              type="button"
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              {selectedImage ? "Change Image" : "Upload Image"}
            </Button>
            
            {currentAvatarUrl && !selectedImage && (
              <Button 
                variant="destructive" 
                onClick={removeAvatar}
                disabled={isUploading}
                type="button"
                className="flex items-center gap-2"
              >
                <X size={16} />
                Remove
              </Button>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setIsOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          {selectedImage && (
            <Button 
              onClick={uploadAvatar}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? "Uploading..." : "Save"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
