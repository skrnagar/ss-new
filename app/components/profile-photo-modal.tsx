
"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { Camera, Edit, Trash2, X, RotateCcw, RotateCw, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

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

  // Create preview when file is selected
  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }, [selectedFile])

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  // Handle file change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setActiveTab("crop")
  }

  // Handle save photo
  const handleSavePhoto = async () => {
    if (!selectedFile) return

    try {
      setLoading(true)

      // Create unique file name
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${selectedFile.name}`
      const file = selectedFile

      console.log(`Attempting to upload file to avatars/${fileName}`)

      // Upload file to avatars bucket
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

      console.log('Upload successful:', data)

      // Generate public URL
      const publicUrl = `${supabase.storage.from('avatars').getPublicUrl(data.path).data.publicUrl}`
      
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
        title: "Profile photo updated",
        description: "Your avatar has been updated successfully",
      })

      // Close modal
      onClose()

      // Refresh the page
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
        <div className="p-0 flex flex-col md:flex-row">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          {/* Image Preview Area */}
          <div className="w-full md:w-2/3 bg-gray-100 flex flex-col justify-center items-center p-6">
            <div className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center">
              {previewUrl ? (
                <div className="rounded-full overflow-hidden w-56 h-56 border-2 border-white">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${zoom/50}) rotate(${straighten - 50}deg)`,
                      filter: `brightness(${brightness/50}) contrast(${contrast/50})`
                    }}
                  />
                </div>
              ) : (
                <Avatar className="h-56 w-56 border-2 border-white">
                  <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={name} />
                  <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="w-full md:w-1/3 border-l">
            {!previewUrl ? (
              <div className="p-6">
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
                  
                  <div className="text-center mt-2 text-sm text-muted-foreground">
                    {loading ? "Uploading..." : "Photo helps people recognize you"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <Tabs defaultValue="crop" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="crop">Crop</TabsTrigger>
                    <TabsTrigger value="filter">Filter</TabsTrigger>
                    <TabsTrigger value="adjust">Adjust</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="crop" className="space-y-4">
                    <div className="flex justify-center gap-4 mb-4">
                      <Button variant="outline" size="icon">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Zoom</span>
                        </div>
                        <Slider 
                          value={[zoom]} 
                          onValueChange={(value) => setZoom(value[0])}
                          min={20} 
                          max={100} 
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Straighten</span>
                        </div>
                        <Slider 
                          value={[straighten]} 
                          onValueChange={(value) => setStraighten(value[0])}
                          min={0} 
                          max={100} 
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="filter" className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-xs">Original</span>
                      </div>
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-xs">B&W</span>
                      </div>
                      <div className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                        <span className="text-xs">Vintage</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="adjust" className="space-y-4">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Brightness</span>
                        </div>
                        <Slider 
                          value={[brightness]} 
                          onValueChange={(value) => setBrightness(value[0])}
                          min={0} 
                          max={100} 
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Contrast</span>
                        </div>
                        <Slider 
                          value={[contrast]} 
                          onValueChange={(value) => setContrast(value[0])}
                          min={0} 
                          max={100} 
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
