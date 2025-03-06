"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function ProfileEditor({ profile, onUpdate }: { profile: any, onUpdate: () => void }) {
  const [name, setName] = useState(profile.full_name || profile.name || "")
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
      // Log the data being sent for debugging
      console.log('Updating profile with data:', {
        name,
        bio,
        position: position || null,
        company: company || null,
        location: location || null,
        updated_at: new Date().toISOString(),
      })

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: profile.id,
          full_name: name,
          bio,
          position: position || null,
          company: company || null,
          location: location || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      onUpdate()
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <Textarea 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          placeholder="Tell others about yourself"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Position</label>
        <Input 
          value={position} 
          onChange={(e) => setPosition(e.target.value)} 
          placeholder="Your job position"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Company</label>
        <Input 
          value={company} 
          onChange={(e) => setCompany(e.target.value)} 
          placeholder="Your company"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Your location"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}