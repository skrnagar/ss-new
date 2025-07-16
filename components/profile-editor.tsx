"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export function ProfileEditor({ profile, onUpdate }: { profile: any; onUpdate: () => void }) {
  const [name, setName] = useState(profile.name || "");
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [position, setPosition] = useState(profile.position || "");
  const [company, setCompany] = useState(profile.company || "");
  const [location, setLocation] = useState(profile.location || "");
  const [avatar, setAvatar] = useState<File | null>(null); // Added state for avatar
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = profile.avatar_url; // Preserve existing avatar

      if (avatar) {
        const fileExt = avatar.name.split('.').pop()?.toLowerCase();
        const contentType = fileExt === 'png' ? 'image/png' : 
                          fileExt === 'jpg' || fileExt === 'jpeg' ? 'image/jpeg' :
                          fileExt === 'webp' ? 'image/webp' :
                          fileExt === 'gif' ? 'image/gif' : 'image/jpeg';
                          
        const timestamp = Date.now();
        const fileName = `${profile.id}/${timestamp}-${avatar.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatar, {
            cacheControl: "3600",
            upsert: true,
            contentType: avatar.type || 'image/jpeg' // Use file's actual type or fallback
          });

        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);
          
        avatarUrl = publicUrlData.publicUrl;
      }


      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name,
          full_name: fullName,
          bio,
          position,
          company,
          location,
          avatar_url: avatarUrl, // Update avatar URL
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Avatar</label>
        <input type="file" onChange={handleAvatarChange} /> {/* Added avatar input */}
      </div>
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
  );
}