"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

import { DebugProfileUpdate } from "./debug-profile-update"

export function ProfileEditor({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const [name, setName] = useState(profile.name || "")
  const [fullName, setFullName] = useState(profile.full_name || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [position, setPosition] = useState(profile.position || "")
  const [company, setCompany] = useState(profile.company || "")
  const [location, setLocation] = useState(profile.location || "")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Get current session user to ensure we have the latest user ID
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("User not authenticated")
      }

      console.log("Updating profile for user:", userId);

      // Call directly to our custom safe_upsert_profile function 
      // This function was created in lib/create-profile-upsert-function.ts
      const { data, error } = await supabase.rpc('safe_upsert_profile', {
        user_id: userId,
        username_val: name,
        full_name_val: fullName,
        bio_val: bio,
        company_val: company,
        position_val: position,
        location_val: location
      });

      if (error) {
        console.error("RPC Error:", error);
        throw error;
      }

      console.log("Profile updated successfully:", data);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      onUpdate()
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Your username"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <Input 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          placeholder="Your full name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Textarea 
          value={bio || ""} 
          onChange={(e) => setBio(e.target.value)} 
          placeholder="Tell others about yourself"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Position</label>
        <Input 
          value={position || ""} 
          onChange={(e) => setPosition(e.target.value)} 
          placeholder="Your job position"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Company</label>
        <Input 
          value={company || ""} 
          onChange={(e) => setCompany(e.target.value)} 
          placeholder="Your company"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input 
          value={location || ""} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Your location"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <DebugProfileUpdate />
    </form>
  )
}