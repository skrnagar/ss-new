
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
      updateData.bio = bio || null // Allow empty bio as null
      updateData.position = position || null
      updateData.company = company || null
      updateData.location = location || null

      console.log("Update data:", updateData);

      try {
        console.log("Starting profile update process");
        
        // First check if profile exists
        console.log("Checking if profile exists for user ID:", userId);
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error("Error checking profile:", profileError);
          
          if (profileError.code !== 'PGRST116') {
            // Log more details about the error
            console.error("Profile error details:", {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint,
              status: profileError.status
            });
            throw profileError;
          } else {
            console.log("Profile not found, will create a new one");
          }
        } else {
          console.log("Existing profile found:", existingProfile);
        }

        let result;
        
        if (!existingProfile) {
          // Profile doesn't exist, insert instead
          console.log("Profile doesn't exist, inserting new profile");
          const insertData = {
            id: userId,
            name,
            full_name: fullName,
            bio: bio || null,
            position: position || null,
            company: company || null,
            location: location || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          result = await supabase
            .from("profiles")
            .insert(insertData);
        } else {
          // Try using a different approach - direct update with where clause
          console.log("Updating profile with direct approach for ID:", userId);
          result = await supabase
            .from("profiles")
            .update(updateData)
            .eq('id', userId);
            
          // Log the complete response
          console.log("Update result:", result);
          console.log("Update status:", result.status, result.statusText);
          
          // Also try to debug the request URL that's being used
          console.log("Request info:", {
            table: "profiles",
            method: "UPDATE",
            filter: `id=${userId}`
          });
        }

        // Check for errors with more detailed logging
        if (result.error) {
          console.error("Supabase error details:", {
            code: result.error.code,
            message: result.error.message,
            details: result.error.details,
            hint: result.error.hint
          });
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

      if (result.error) {
        console.error("Error updating profile:", result.error);
        console.error("Update data sent:", JSON.stringify(updateData));
        console.error("Error details:", {
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          status: result.error.status
        });
        
        // Try to get more details about the request
        const { error: metadataError } = await supabase.from('profiles').select('id').single();
        if (metadataError) {
          console.error("Additional metadata error:", metadataError);
        }
        
        throw result.error;
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
