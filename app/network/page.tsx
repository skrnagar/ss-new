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

export default function NetworkPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNetworkData();
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      console.log("Fetching connection requests...");
      // Fetch received connection requests
      const { data: receivedRequests, error: receivedError } = await supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_user_id_fkey(*)
        `)
        .eq("connected_user_id", user?.id)
        .eq("status", "pending");

      // Fetch sent connection requests
      const { data: sentConnectionRequests } = await supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_connected_user_id_fkey(*)
        `)
        .eq("user_id", user?.id)
        .eq("status", "pending");

      if (receivedError) {
        console.error("Error fetching received requests:", receivedError);
      }
      
      console.log("Received requests:", receivedRequests);
      console.log("Sent requests:", sentConnectionRequests);
      
      setConnectionRequests(receivedRequests || []);
      setSentRequests(sentConnectionRequests || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchNetworkData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch accepted connections
      const { data: connectionData } = await supabase
        .from("connections")
        .select("*, profile:profiles(*)")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      // Get all connected user IDs (both accepted and pending)
      const { data: allConnections } = await supabase
        .from("connections")
        .select("connected_user_id, user_id, status")
        .or(`user_id.eq.${user.id},connected_user_id.eq.${user.id}`);

      // Extract all user IDs that should be excluded from suggestions
      const excludeIds = allConnections?.reduce((acc: string[], conn) => {
        if (conn.user_id === user.id) {
          acc.push(conn.connected_user_id);
        } else {
          acc.push(conn.user_id);
        }
        return acc;
      }, []) || [];

      // Add current user's ID to exclude list
      excludeIds.push(user.id);

      // Fetch suggestions excluding connected users and pending requests
      const { data: suggestionData } = await supabase
        .from("profiles")
        .select("*")
        .not("id", "in", `(${excludeIds.join(",")})`)
        .limit(5);

      setConnections(connectionData || []);
      setSuggestions(suggestionData || []);
    } catch (error) {
      console.error("Error fetching network data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (profileId: string) => {
    setConnectLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .insert([{ user_id: user?.id, connected_user_id: profileId, status: "pending" }]);

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
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
        title: "Request sent",
        description: "Connection request sent successfully",
      });

      fetchNetworkData();
      fetchRequests();
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setConnectLoading(false);
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
        description: "You are now connected",
      });

      fetchNetworkData();
      fetchRequests();
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive",
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
        variant: "destructive",
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
                          <h3 className="font-medium">{request.profile.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.profile.headline}
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
                          <h3 className="font-medium">{request.profile.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.profile.headline}
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
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                        <div className="h-3 w-[150px] bg-muted animate-pulse rounded" />
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
                          <h3 className="font-medium">{connection.profile.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {connection.profile.headline}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/messages/${connection.profile.id}`}>Message</Link>
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => handleConnect(profile.id)}
                              disabled={connectLoading}
                            >
                              {connectLoading ? "Connecting..." : "Connect"}
                            </Button>
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