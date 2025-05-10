
"use client";

import { Button } from "@/components/ui/button";
import { UserCheck, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function ConnectButton({ userId, profileId }: { userId: string; profileId: string }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'loading'>('loading');
  const [connectionId, setConnectionId] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, [userId, profileId]);

  const checkConnectionStatus = async () => {
    try {
      const { data: connections } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(user_id.eq.${userId},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${userId})`);

      if (connections && connections.length > 0) {
        setStatus(connections[0].status as 'pending' | 'accepted');
        setConnectionId(connections[0].id);
      } else {
        setStatus('none');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setStatus('none');
    }
  };

  const handleConnect = async () => {
    try {
      setStatus('loading');
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
      
      checkConnectionStatus();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
      setStatus('none');
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionId) return;
    
    try {
      setStatus('loading');
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection removed",
        description: "Connection has been removed successfully",
      });
      
      setStatus('none');
      setConnectionId(null);
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive",
      });
      checkConnectionStatus();
    }
  };

  if (status === 'loading') {
    return (
      <Button variant="outline" className="flex-1" disabled>
        Loading...
      </Button>
    );
  }

  if (status === 'accepted') {
    return (
      <Button variant="outline" className="flex-1" onClick={handleRemoveConnection}>
        <UserCheck className="h-4 w-4 mr-2" />
        Connected
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button variant="outline" className="flex-1" disabled>
        <UserClock className="h-4 w-4 mr-2" />
        Pending
      </Button>
    );
  }

  return (
    <Button variant="outline" className="flex-1" onClick={handleConnect}>
      <UserPlus className="h-4 w-4 mr-2" />
      Connect
    </Button>
  );
}
