
"use client"

import React, { useState } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarEditPopup } from "@/components/avatar-edit-popup"
import { Camera } from "lucide-react"

interface ProfileAvatarEditorProps {
  avatarUrl: string | null
  userId: string
  userName: string
  onAvatarChange: (url: string) => void
  size?: "sm" | "md" | "lg"
  editable?: boolean
}

export function ProfileAvatarEditor({
  avatarUrl,
  userId,
  userName,
  onAvatarChange,
  size = "md",
  editable = true
}: ProfileAvatarEditorProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part?.[0] || '')
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  }
  
  const handleAvatarClick = () => {
    if (editable) {
      setIsPopupOpen(true)
    }
  }

  return (
    <>
      <div className="relative inline-block">
        <div onClick={handleAvatarClick} className={`${editable ? 'cursor-pointer' : ''}`}>
          <Avatar 
            className={`${sizeClasses[size]}`}
          >
            <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={userName} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </div>
        
        {editable && (
          <div 
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer shadow-md"
            onClick={handleAvatarClick}
          >
            <Camera size={16} />
          </div>
        )}
      </div>
      
      <AvatarEditPopup
        isOpen={isPopupOpen}
        setIsOpen={setIsPopupOpen}
        currentAvatarUrl={avatarUrl}
        userId={userId}
        userName={userName}
        onAvatarChange={onAvatarChange}
      />
    </>
  )
}
