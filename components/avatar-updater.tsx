
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AvatarUpdaterProps {
  userId: string
  avatarUrl: string | null
  username: string
  onAvatarUpdate: (url: string) => void
}

export function AvatarUpdater({ userId, avatarUrl, username, onAvatarUpdate }: AvatarUpdaterProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'US'
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
      
      // Upload to Supabase Storage with proper folder structure
      const fileName = `${userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (error) {
        console.error("Storage upload error:", error)
        throw error
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)
        .select()
        
      if (updateError) {
        console.error("Profile update error:", updateError)
        throw updateError
      }
      
      // Call the callback with the new URL
      onAvatarUpdate(publicUrl)
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated",
      })
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Avatar 
        className="h-24 w-24 mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
        onClick={handleAvatarClick}
      >
        <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={username} />
        <AvatarFallback>{getInitials(username)}</AvatarFallback>
      </Avatar>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleAvatarClick}
        disabled={loading}
      >
        {loading ? "Uploading..." : "Change Photo"}
      </Button>
    </div>
  )
}
