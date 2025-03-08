
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(avatarUrl)
  const router = useRouter()

  // Update currentAvatarUrl when avatarUrl prop changes
  useEffect(() => {
    setCurrentAvatarUrl(avatarUrl)
  }, [avatarUrl])

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

  // Handle avatar click to open modal
  const handleAvatarClick = () => {
    if (isOwnProfile) {
      setModalOpen(true)
    }
  }

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false)
  }

  return (
    <>
      <Avatar 
        className={`h-24 w-24 mb-4 ${isOwnProfile ? 'cursor-pointer hover:opacity-80' : ''}`} 
        onClick={handleAvatarClick}
      >
        <AvatarImage src={currentAvatarUrl || "/placeholder-user.jpg"} alt={name} />
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      
      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        userId={userId}
        avatarUrl={currentAvatarUrl}
        name={name}
        isOpen={modalOpen}
        onClose={handleModalClose}
      />
    </>
  )
}
