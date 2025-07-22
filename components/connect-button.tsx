
"use client";

import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ConnectButton = React.memo(function ConnectButton({ userId, profileId }: { userId: string; profileId: string }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<'none' | 'pending' | 'accepted' | 'loading'>('loading');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<'sent' | 'received' | null>(null); // NEW

  useEffect(() => {
    checkConnectionStatus();
  }, [userId, profileId]);

  const checkConnectionStatus = useCallback(async () => {
    try {
      const { data: connections, error } = await supabase
        .from('connections')
        .select('id, status, user_id, connected_user_id')
        .or(`and(user_id.eq.${userId},connected_user_id.eq.${profileId}),and(user_id.eq.${profileId},connected_user_id.eq.${userId})`);

      if (error) throw error;

      if (connections && connections.length > 0) {
        setStatus(connections[0].status as 'pending' | 'accepted');
        setConnectionId(connections[0].id);
        if (connections[0].status === 'pending') {
          if (connections[0].user_id === userId) {
            setPendingDirection('sent');
          } else {
            setPendingDirection('received');
          }
        } else {
          setPendingDirection(null);
        }
      } else {
        setStatus('none');
        setPendingDirection(null);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      toast({
        title: "Error",
        description: "Could not check connection status",
        variant: "destructive"
      });
      setStatus('none');
      setPendingDirection(null);
    }
  }, [userId, profileId, toast]);

  const handleConnect = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // Check for reverse request first
      const { data: reverseRequest } = await supabase
        .from('connections')
        .select('id, status')
        .eq('user_id', profileId)
        .eq('connected_user_id', userId)
        .eq('status', 'pending')
        .single();

      if (reverseRequest) {
        // Auto-accept the reverse request
        const { error: updateError } = await supabase
          .from('connections')
          .update({ status: 'accepted' })
          .eq('id', reverseRequest.id);

        if (updateError) throw updateError;

        toast({
          title: "Connected!",
          description: "You are now connected with this user",
        });
      } else {
        // Create new request
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
      }
      
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
  }, [userId, profileId, isProcessing, toast, checkConnectionStatus]);

  const handleWithdrawRequest = useCallback(async () => {
    if (!connectionId || isProcessing) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Request withdrawn",
        description: "Connection request has been withdrawn",
      });
      
      await checkConnectionStatus();
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error withdrawing request:', error);
      toast({
        title: "Error",
        description: "Failed to withdraw request",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [connectionId, isProcessing, toast, checkConnectionStatus]);

  const handleRemoveConnection = useCallback(async () => {
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
      setShowConfirmDialog(false);
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
  }, [connectionId, isProcessing, toast, checkConnectionStatus]);

  const handleAcceptRequest = useCallback(async () => {
    if (!connectionId || isProcessing) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);
      if (error) throw error;
      toast({ title: "Connection accepted", description: "You are now connected!" });
      await checkConnectionStatus();
    } catch (error) {
      toast({ title: "Error", description: "Failed to accept request", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  }, [connectionId, isProcessing, toast, checkConnectionStatus]);

  if (status === 'loading') {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (status === 'accepted') {
    return (
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <UserCheck className="h-4 w-4 mr-2" />
            Connected
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this connection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveConnection} disabled={isProcessing}>
              {isProcessing ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (status === 'pending') {
    if (pendingDirection === 'sent') {
      // Show Pending + Withdraw
      return (
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogTrigger asChild>
            <Button variant="outline">
              <UserMinus className="h-4 w-4 mr-2" />
              Pending
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Withdraw Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to withdraw this connection request?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleWithdrawRequest} disabled={isProcessing}>
                {isProcessing ? "Withdrawing..." : "Withdraw"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    } else if (pendingDirection === 'received') {
      // Show Accept + Ignore
      return (
        <div className="flex gap-2">
          <Button variant="default" onClick={handleAcceptRequest} disabled={isProcessing}>
            <UserCheck className="h-4 w-4 mr-2" />
            {isProcessing ? "Accepting..." : "Accept"}
          </Button>
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <UserMinus className="h-4 w-4 mr-2" />
                Ignore
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ignore Request</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to ignore this connection request?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleWithdrawRequest} disabled={isProcessing}>
                  {isProcessing ? "Ignoring..." : "Ignore"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
  }

  return (
    <Button onClick={handleConnect} disabled={isProcessing}>
      <UserPlus className="h-4 w-4 mr-2" />
      {isProcessing ? 'Connecting...' : 'Connect'}
    </Button>
  );
});
