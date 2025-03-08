
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
        <button 
          type="button"
          onClick={handleAvatarClick} 
          className={`${editable ? 'cursor-pointer group/avatar relative' : ''} bg-transparent border-0 p-0`}
          aria-label="Edit profile avatar"
        >
          <Avatar 
            className={`${sizeClasses[size]} ${editable ? 'transition-opacity group-hover/avatar:opacity-80' : ''}`}
          >
            <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt={userName} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
          
          {editable && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              <div className="bg-black/40 rounded-full p-2">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </button>
        
        {editable && (
          <button 
            type="button"
            className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer shadow-md z-10 border-0"
            onClick={handleAvatarClick}
            aria-label="Edit profile avatar"
          >
            <Camera size={16} />
          </button>
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
