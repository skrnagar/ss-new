"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { X, Upload, Eye, RotateCcw, RotateCw } from "lucide-react"

interface ProfilePhotoModalProps {
  userId: string
  avatarUrl: string | null
  name: string
  isOpen: boolean
  onClose: () => void
}

export function ProfilePhotoModal({ userId, avatarUrl, name, isOpen, onClose }: ProfilePhotoModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("crop")
  const [zoom, setZoom] = useState(50)
  const [straighten, setStraighten] = useState(50)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)

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

  // Reset editing state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null)
      setPreviewUrl(null)
      setActiveTab("crop")
      setZoom(50)
      setStraighten(50)
      setBrightness(50)
      setContrast(50)
    }
  }, [isOpen])

  // Set up click outside to close
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
      transform: `rotate(${(straighten - 50) * 0.06}deg) scale(${zoom / 50})`,
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef} 
        className="bg-background rounded-lg shadow-lg max-w-4xl w-full overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Edit photo</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] max-h-[600px]">
          {/* Preview Area */}
          <div className="flex-1 bg-muted flex items-center justify-center p-4 overflow-hidden">
            {previewUrl ? (
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Photo Preview with applied styles */}
                <div className="relative w-80 h-80 overflow-hidden rounded-full border-2 border-white/20">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={getImageStyles()}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={name} />
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <Button onClick={handleFileSelect} className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </div>
            )}
          </div>

          {/* Controls Area */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l">
            {previewUrl && (
              <div className="p-4">
                {/* Tabs */}
                <div className="flex border-b mb-4">
                  <button
                    className={`px-4 py-2 ${activeTab === 'crop' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('crop')}
                  >
                    Crop
                  </button>
                  <button
                    className={`px-4 py-2 ${activeTab === 'filter' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('filter')}
                  >
                    Filter
                  </button>
                  <button
                    className={`px-4 py-2 ${activeTab === 'adjust' ? 'border-b-2 border-primary font-medium' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('adjust')}
                  >
                    Adjust
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Rotation Controls */}
                  <div className="flex justify-center gap-4 mb-6">
                    <button 
                      className="p-2 rounded-full hover:bg-muted"
                      onClick={() => setStraighten(Math.max(0, straighten - 5))}
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                    <button 
                      className="p-2 rounded-full hover:bg-muted"
                      onClick={() => setStraighten(Math.min(100, straighten + 5))}
                    >
                      <RotateCw className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Zoom Control */}
                  <div>
                    <p className="text-sm font-medium mb-2">Zoom</p>
                    <Slider 
                      value={[zoom]} 
                      onValueChange={(values) => setZoom(values[0])} 
                      min={25} 
                      max={150} 
                      step={1}
                    />
                  </div>

                  {/* Straighten Control */}
                  <div>
                    <p className="text-sm font-medium mb-2">Straighten</p>
                    <Slider 
                      value={[straighten]} 
                      onValueChange={(values) => setStraighten(values[0])} 
                      min={0} 
                      max={100} 
                      step={1}
                    />
                  </div>

                  {activeTab === 'adjust' && (
                    <>
                      {/* Brightness Control */}
                      <div>
                        <p className="text-sm font-medium mb-2">Brightness</p>
                        <Slider 
                          value={[brightness]} 
                          onValueChange={(values) => setBrightness(values[0])} 
                          min={0} 
                          max={100} 
                          step={1}
                        />
                      </div>

                      {/* Contrast Control */}
                      <div>
                        <p className="text-sm font-medium mb-2">Contrast</p>
                        <Slider 
                          value={[contrast]} 
                          onValueChange={(values) => setContrast(values[0])} 
                          min={0} 
                          max={100} 
                          step={1}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setPreviewUrl(null)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Anyone
                      </Button>
                      <Button onClick={handleSavePhoto} disabled={loading}>
                        {loading ? "Saving..." : "Save photo"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}