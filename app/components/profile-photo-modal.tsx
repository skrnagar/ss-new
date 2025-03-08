"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X, Upload, Eye, RotateCcw, RotateCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface ProfilePhotoModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  avatarUrl: string | null
  name: string
  onAvatarUpdate: (url: string) => void
}

export function ProfilePhotoModal({
  isOpen,
  onClose,
  userId,
  avatarUrl,
  name,
  onAvatarUpdate
}: ProfilePhotoModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("crop")
  const [zoom, setZoom] = useState([1])
  const [straighten, setStraighten] = useState(50)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  // Using the imported supabase client directly

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

  // Reset editing state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setPreviewUrl(null)
      setActiveTab("crop")
      setZoom([1])
      setStraighten(50)
      setBrightness(50)
      setContrast(50)
    }
  }, [isOpen])

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    }
  }

  // Apply CSS filters based on slider values
  const getImageStyles = () => {
    return {
      transform: `rotate(${(straighten - 50) * 0.06}deg) scale(${zoom[0]})`,
      filter: `brightness(${brightness / 50}) contrast(${contrast / 50})`,
      transition: 'transform 0.2s, filter 0.2s',
    }
  }

  // Handle save photo
  const handleSavePhoto = async () => {
    if (!selectedFile) return

    setLoading(true)

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, {
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been updated successfully",
      })

      // Update the avatar in the parent component
      if (onAvatarUpdate) {
        onAvatarUpdate(urlData.publicUrl)
      }

      // Close modal and refresh
      onClose()
      router.refresh()

    } catch (error: any) {
      toast({
        title: "Error updating photo",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile photo</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-6 py-4">
          {previewUrl ? (
            <div className="relative h-40 w-40 rounded-full overflow-hidden bg-muted">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
                style={getImageStyles()}
              />
            </div>
          ) : (
            <Avatar className="h-40 w-40">
              <AvatarImage src={avatarUrl || ''} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
          )}

          {previewUrl && (
            <div className="w-full px-4">
              <p className="text-sm font-medium mb-2">Zoom</p>
              <Slider 
                value={zoom} 
                min={0.5} 
                max={2} 
                step={0.1} 
                onValueChange={setZoom} 
              />
            </div>
          )}

          <div className="flex gap-4 w-full justify-center">
            {!previewUrl ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleFileSelect}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="default" onClick={handleSavePhoto} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}