
"use client"

import React, { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Camera, Upload, X } from "lucide-react"

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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
    
    setTempImageFile(file)
    
    // Create a preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }
  
  const handleCancel = () => {
    setSelectedImage(null)
    setTempImageFile(null)
    setIsOpen(false)
  }
  
  const handleSave = async () => {
    if (!tempImageFile) return
    
    try {
      setIsUploading(true)
      
      // Upload to Supabase Storage
      const fileName = `avatar-${userId}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, tempImageFile, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // Update the avatar URL in the profile
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
      
      handleCancel()
    } catch (error: any) {
      toast({
        title: "Failed to update avatar",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }
  
  const removeImage = () => {
    setSelectedImage(null)
    setTempImageFile(null)
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
              Upload photo
            </Button>
            
            <Button 
              variant="outline" 
              onClick={triggerFileSelect} 
              disabled={isUploading}
              type="button"
              className="flex items-center gap-2"
            >
              <Camera size={16} />
              Take photo
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!selectedImage || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
