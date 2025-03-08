
"use client"

import React from 'react'
import Image, { ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  className?: string
}

export function OptimizedImage({ className = "", ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  
  return (
    <div className={`relative ${className} ${!isLoaded ? 'bg-muted animate-pulse' : ''}`}>
      <Image
        {...props}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading="eager"
        priority={props.priority === undefined ? true : props.priority}
      />
    </div>
  )
}
