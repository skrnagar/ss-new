"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { MessageSquare, UserMinus, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMutualConnections, setShowMutualConnections] = useState(false);
  const [selectedMutualConnections, setSelectedMutualConnections] = useState<any[]>([]);

  const sortedAndFilteredConnections = connections
    .filter(conn => 
      conn.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.profile.headline?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.profile.full_name.localeCompare(b.profile.full_name);
    });

  const handleShowMutualConnections = async (profileId: string) => {
    // Fetch mutual connections
    const mutuals = await fetchMutualConnections(profileId);
    setSelectedMutualConnections(mutuals);
    setShowMutualConnections(true);
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchPendingRequests();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch both sent and received connections in parallel for completeness
      const [sentConnections, receivedConnections] = await Promise.all([
        supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!connections_connected_user_id_fkey(
              id,
              full_name,
              headline,
              avatar_url,
              username
            )
          `)
          .eq("user_id", user.id)
          .eq("status", "accepted"),
          
        supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!connections_user_id_fkey(
              id,
              full_name,
              headline,
              avatar_url,
              username
            )
          `)
          .eq("connected_user_id", user.id)
          .eq("status", "accepted")
      ]);

      if (sentConnections.error) throw sentConnections.error;
      if (receivedConnections.error) throw receivedConnections.error;

      const allConnections = [
        ...(sentConnections.data || []),
        ...(receivedConnections.data || [])
      ];

      setConnections(allConnections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      toast({
        title: "Error fetching connections",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data: requestData, error } = await supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!user_id(*)
        `)
        .eq("connected_user_id", user?.id)
        .eq("status", "pending");

      if (error) throw error;
      setPendingRequests(requestData || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      await Promise.all([
        fetchConnections(),
        fetchPendingRequests()
      ]);
    } catch (error) {
      console.error("Error accepting connection:", error);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase.from("connections").delete().eq("id", connectionId);

      if (error) throw error;

      fetchConnections();
    } catch (error) {
      console.error("Error removing connection:", error);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">My Network</h1>

      {pendingRequests.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Connection Requests</h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.profile.avatar_url} />
                      <AvatarFallback>{request.profile.full_name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{request.profile.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{request.profile.headline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAcceptConnection(request.id)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">My Connections</h2>
            <p className="text-sm text-muted-foreground">{connections.length} connections</p>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                    <div className="h-3 w-[150px] bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : connections.length > 0 ? (
            <div className="grid gap-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={connection.profile.avatar_url} />
                      <AvatarFallback>
                        {connection.profile.full_name?.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/profile/${connection.profile.username}`}
                        className="font-medium hover:underline"
                      >
                        {connection.profile.full_name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{connection.profile.headline}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/messages/${connection.profile.id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveConnection(connection.id)}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>You don't have any connections yet.</p>
              <p className="mt-2">Start connecting with other professionals in your field!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
