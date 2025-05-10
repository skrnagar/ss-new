
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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, [userId, profileId]);

  const checkConnectionStatus = async () => {
    try {
      const { data: connections, error } = await supabase
        .from('connections')
        .select('id, status')
        .or(`and(user_id.eq.${userId},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${userId})`);

      if (error) throw error;

      if (connections && connections.length > 0) {
        setStatus(connections[0].status as 'pending' | 'accepted');
        setConnectionId(connections[0].id);
      } else {
        setStatus('none');
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      toast({
        title: "Error",
        description: "Could not check connection status",
        variant: "destructive"
      });
      setStatus('none');
    }
  };

  const handleConnect = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .insert([{ user_id: userId, connected_user_id: profileId, status: 'pending' }]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already connected",
            description: "You already have a pending or accepted connection",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Request sent",
        description: "Connection request sent successfully",
      });
      
      await checkConnectionStatus();
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveConnection = async () => {
    if (!connectionId || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Connection removed",
        description: "Connection has been removed successfully",
      });
      
      await checkConnectionStatus();
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (status === 'accepted') {
    return (
      <Button variant="outline" onClick={handleRemoveConnection} disabled={isProcessing}>
        <UserMinus className="h-4 w-4 mr-2" />
        {isProcessing ? 'Removing...' : 'Connected'}
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button variant="outline" disabled>
        <UserCheck className="h-4 w-4 mr-2" />
        Pending
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isProcessing}>
      <UserPlus className="h-4 w-4 mr-2" />
      {isProcessing ? 'Connecting...' : 'Connect'}
    </Button>
  );
}
