
"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function ConnectButton({ userId, profileId }: { userId: string; profileId: string }) {
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert([{ 
          user_id: userId, 
          connected_user_id: profileId, 
          status: 'pending' 
        }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already connected",
            description: "You already have a connection or pending request with this user",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Connection request sent",
        description: "Your connection request has been sent successfully",
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" className="flex-1" onClick={handleConnect}>
      <UserPlus className="h-4 w-4 mr-2" />
      Connect
    </Button>
  );
}
