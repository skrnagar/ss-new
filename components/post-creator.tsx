
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, FileText, Video, User, X, Upload, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function PostCreator({ userProfile }: { userProfile: any }) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachmentType, setAttachmentType] = useState<"image" | "document" | "video" | null>(null)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleAttachmentSelect = (type: "image" | "document" | "video") => {
    setAttachmentType(type)
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type based on attachmentType
    if (
      (attachmentType === "image" && !file.type.startsWith("image/")) ||
      (attachmentType === "video" && !file.type.startsWith("video/")) ||
      (attachmentType === "document" && !file.type.includes("pdf"))
    ) {
      toast({
        title: "Invalid file type",
        description: `Please select a ${attachmentType} file`,
        variant: "destructive",
      })
      return
    }

    setAttachment(file)

    // Create preview for images
    if (attachmentType === "image") {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachmentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else if (attachmentType === "document") {
      setAttachmentPreview("document")
    } else if (attachmentType === "video") {
      setAttachmentPreview("video")
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    setAttachmentPreview(null)
    setAttachmentType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !attachment) {
      toast({
        title: "Empty post",
        description: "Please add some content or an attachment to your post",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to post",
          variant: "destructive",
        })
        return
      }

      let attachmentUrl = null

      // Upload attachment if exists
      if (attachment) {
        const fileExt = attachment.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`
        
        // Choose the appropriate bucket based on file type
        const bucketName = 
          attachmentType === "image" ? "post_images" : 
          attachmentType === "video" ? "post_videos" : "post_documents"
        
        // Upload the file
        const { error: uploadError, data } = await supabase.storage
          .from(bucketName)
          .upload(filePath, attachment)

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath)

        attachmentUrl = urlData.publicUrl
      }

      // Create the post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content,
          image_url: attachmentType === "image" ? attachmentUrl : null,
          video_url: attachmentType === "video" ? attachmentUrl : null,
          document_url: attachmentType === "document" ? attachmentUrl : null,
        })

      if (postError) {
        throw postError
      }

      // Clear form after successful post
      setContent("")
      removeAttachment()
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      })
      
      // Refresh the feed
      router.refresh()

    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message || "An error occurred while creating your post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url || ""} alt={userProfile?.full_name || "User"} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea 
              className="min-h-[60px] resize-none" 
              placeholder="Share an update or post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {attachmentPreview && (
              <div className="relative mt-2 border rounded-md p-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80"
                  onClick={removeAttachment}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                {attachmentType === "image" && (
                  <div className="relative aspect-video bg-muted/20 rounded-md overflow-hidden">
                    <img 
                      src={attachmentPreview} 
                      alt="Preview" 
                      className="object-contain w-full h-full" 
                    />
                  </div>
                )}
                
                {attachmentType === "document" && (
                  <div className="flex items-center p-2 bg-muted/20 rounded-md">
                    <FileText className="h-8 w-8 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">{attachment?.name}</span>
                  </div>
                )}
                
                {attachmentType === "video" && (
                  <div className="flex items-center p-2 bg-muted/20 rounded-md">
                    <Video className="h-8 w-8 mr-2 text-red-500" />
                    <span className="text-sm font-medium">{attachment?.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => handleAttachmentSelect("image")}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Photo
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => handleAttachmentSelect("video")}
            >
              <Video className="h-4 w-4 mr-2" />
              Video
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground"
              onClick={() => handleAttachmentSelect("document")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Document
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept={
                attachmentType === "image" 
                  ? "image/*" 
                  : attachmentType === "video" 
                    ? "video/*" 
                    : "application/pdf"
              }
            />
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              <>Post</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
