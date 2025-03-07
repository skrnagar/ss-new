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

      // Prepare update data - only include non-empty fields
      const updateData: any = { 
        id: userId, // Include ID in update data to ensure proper matching
        updated_at: new Date().toISOString()
      }

      // Only include fields that have actual values (not undefined or empty)
      if (name) updateData.name = name
      if (fullName) updateData.full_name = fullName
      if (bio !== undefined) updateData.bio = bio
      if (position !== undefined) updateData.position = position
      if (company !== undefined) updateData.company = company
      if (location !== undefined) updateData.location = location

      console.log("Update data:", updateData);

      try {
        console.log("Starting profile update process for user ID:", userId);

        // Use upsert to handle both insert and update cases
        const result = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            ...updateData, //spread operator to add all fields from updateData
          }, { 
            onConflict: 'id', 
            ignoreDuplicates: false,
            returning: 'minimal' // Reduce data transferred
          });

        // Log the result for debugging
        console.log("Upsert result status:", result.status);
        console.log("Upsert error (if any):", result.error);

        if (result.error) {
          throw result.error;
        }

        // Fetch the updated profile to confirm changes
        const { data: updatedProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        console.log("Profile after update:", updatedProfile);
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        throw dbError;
      }


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