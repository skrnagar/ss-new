
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Calendar, Newspaper, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NetworkPage() {
  const { session } = useAuth();
  const user = session?.user;
  const { toast } = useToast();
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [mutualConnections, setMutualConnections] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNetworkData();
      fetchRequests();
    }
  }, [user]);

  const fetchMutualConnections = async (profileId: string, connections: any[]) => {
    try {
      // Get the user's connections
      const userConnectionIds = connections.map(conn => 
        conn.user_id === user?.id ? conn.connected_user_id : conn.user_id
      );

      // Get the target user's connections
      const { data: targetConnections } = await supabase
        .from('connections')
        .select('user_id, connected_user_id')
        .or(`user_id.eq.${profileId},connected_user_id.eq.${profileId}`)
        .eq('status', 'accepted');

      if (!targetConnections) return 0;

      const targetConnectionIds = targetConnections.map(conn => 
        conn.user_id === profileId ? conn.connected_user_id : conn.user_id
      );

      // Count mutual connections
      const mutual = userConnectionIds.filter(id => targetConnectionIds.includes(id));
      return mutual.length;
    } catch (error) {
      console.error('Error calculating mutual connections:', error);
      return 0;
    }
  };

  const fetchRequests = async () => {
    if (!user?.id) return;
    
    try {
      const [receivedResponse, sentResponse] = await Promise.all([
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
          .eq("status", "pending"),
          
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
          .eq("status", "pending")
      ]);

      if (receivedResponse.error) throw receivedResponse.error;
      if (sentResponse.error) throw sentResponse.error;

      setConnectionRequests(receivedResponse.data || []);
      setSentRequests(sentResponse.data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error fetching requests",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const fetchNetworkData = async () => {
    try {
      // Get all connections where user is either the sender or receiver
      const [sentResponse, receivedResponse] = await Promise.all([
        supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!connections_connected_user_id_fkey(*)
          `)
          .eq("user_id", user?.id)
          .eq("status", "accepted"),
        supabase
          .from("connections")
          .select(`
            *,
            profile:profiles!connections_user_id_fkey(*)
          `)
          .eq("connected_user_id", user?.id)
          .eq("status", "accepted")
      ]);

      const sentConnections = sentResponse.data || [];
      const receivedConnections = receivedResponse.data || [];

      const allConnections = [
        ...sentConnections,
        ...receivedConnections
      ];
      
      // Format connections to have consistent profile structure
      const formattedConnections = allConnections.map(conn => ({
        ...conn,
        profile: conn.user_id === user?.id ? conn.profile : conn.profile
      }));

      // Get suggestions (users not connected)
      const connectedUserIds = formattedConnections.map(conn => 
        conn.user_id === user?.id ? conn.connected_user_id : conn.user_id
      );

      const { data: suggestionData } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user?.id)
        .not("id", "in", connectedUserIds.length > 0 ? `(${connectedUserIds.join(",")})` : "(0)");

      setConnections(formattedConnections || []);
      setSuggestions(suggestionData || []);

      // Calculate mutual connections for suggestions
      const mutualCounts: {[key: string]: number} = {};
      for (const suggestion of (suggestionData || [])) {
        mutualCounts[suggestion.id] = await fetchMutualConnections(suggestion.id, formattedConnections);
      }
      setMutualConnections(mutualCounts);
    } catch (error) {
      console.error("Error fetching network data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch network data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Connection accepted",
        description: "You are now connected!",
      });

      fetchNetworkData();
      fetchRequests();
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive"
      });
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Request rejected",
        description: "Connection request has been rejected",
      });

      fetchRequests();
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <Card className="md:col-span-1">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold mb-4">Manage my network</h2>

            <Link
              href="/network/connections"
              className="flex items-center gap-3 p-2 hover:bg-muted rounded-md"
            >
              <Users className="h-5 w-5" />
              <span>Connections</span>
              <span className="ml-auto text-muted-foreground">{connections.length}</span>
            </Link>

            <Link
              href="/network/followers"
              className="flex items-center gap-3 p-2 hover:bg-muted rounded-md"
            >
              <Users className="h-5 w-5" />
              <span>Following & followers</span>
            </Link>

            <Link
              href="/network/groups"
              className="flex items-center gap-3 p-2 hover:bg-muted rounded-md"
            >
              <Users className="h-5 w-5" />
              <span>Groups</span>
            </Link>

            <Link
              href="/network/events"
              className="flex items-center gap-3 p-2 hover:bg-muted rounded-md"
            >
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>

            <Link
              href="/network/newsletters"
              className="flex items-center gap-3 p-2 hover:bg-muted rounded-md"
            >
              <Newspaper className="h-5 w-5" />
              <span>Newsletters</span>
            </Link>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Connection Requests */}
          {connectionRequests.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Connection Requests</h2>
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.profile.avatar_url} />
                          <AvatarFallback>
                            {request.profile.full_name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profile/${request.profile.username}`}
                            className="font-medium hover:underline"
                          >
                            {request.profile.full_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {request.profile.headline}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mutualConnections[request.profile.id] || 0} mutual connections
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleAcceptConnection(request.id)}>Accept</Button>
                        <Button
                          variant="outline"
                          onClick={() => handleRejectConnection(request.id)}
                        >
                          Ignore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Sent Requests</h2>
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={request.profile.avatar_url} />
                          <AvatarFallback>
                            {request.profile.full_name?.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            href={`/profile/${request.profile.username}`}
                            className="font-medium hover:underline"
                          >
                            {request.profile.full_name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {request.profile.headline}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mutualConnections[request.profile.id] || 0} mutual connections
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary" disabled>Pending</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Connections */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">My Connections</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : connections.length > 0 ? (
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
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
                          <p className="text-sm text-muted-foreground">
                            {connection.profile.headline}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {mutualConnections[connection.profile.id] || 0} mutual connections
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages?userId=${connection.profile.id}`}>Message</Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/profile/${connection.profile.username}`}>
                            View Profile
                          </Link>
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

          {/* People You May Know */}
          {suggestions.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">People you may know</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestions.map((profile) => (
                    <Card key={profile.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback>{profile.full_name?.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium">{profile.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{profile.headline}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mutualConnections[profile.id] || 0} mutual connections
                            </p>
                            <div className="mt-2 space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link href={`/profile/${profile.username}`}>View Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
