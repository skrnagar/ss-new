"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { Calendar, Newspaper, Users } from "lucide-react";
import Link from "next/link";

export default function NetworkPage() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [networkUsers, setNetworkUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetworkData();
  }, [user]);

  const fetchNetworkData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch existing connections
      const { data: connectionData } = await supabase
        .from('connections')
        .select('*, profile:profiles(*)')
        .eq('user_id', user.id);

      // Fetch other users for network suggestions
      const { data: networkData } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .not('id', 'in', (connectionData || []).map(c => c.connected_user_id))
        .limit(10);

      setConnections(connectionData || []);
      setNetworkUsers(networkData || []);
    } catch (error) {
      console.error('Error fetching network data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .insert([
          { user_id: user?.id, connected_user_id: profileId, status: 'pending' }
        ]);

      if (error) throw error;

      fetchNetworkData();
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const [connectionRequests, setConnectionRequests] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch connection requests
      supabase
        .from('connections')
        .select('*, profile:profiles(*)')
        .eq('connected_user_id', user.id)
        .eq('status', 'pending')
        .then(({ data, error }) => {
          if (!error && data) {
            setConnectionRequests(data);
          }
        });
    }
  }, [user]);

  const handleAcceptConnection = async (connectionId: string) => {
    const { error } = await supabase
      .from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId);

    if (!error) {
      fetchNetworkData();
      // Refresh connection requests
      const { data } = await supabase
        .from('connections')
        .select('*, profile:profiles(*)')
        .eq('connected_user_id', user?.id)
        .eq('status', 'pending');
      setConnectionRequests(data || []);
    }
  };

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <Card className="md:col-span-1">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold mb-4">Manage my network</h2>

            <Link href="/network/connections" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
              <Users className="h-5 w-5" />
              <span>Connections</span>
              <span className="ml-auto text-muted-foreground">{connections.length}</span>
            </Link>

            <Link href="/network/followers" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
              <Users className="h-5 w-5" />
              <span>Following & followers</span>
            </Link>

            <Link href="/network/groups" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
              <Users className="h-5 w-5" />
              <span>Groups</span>
              <span className="ml-auto text-muted-foreground">4</span>
            </Link>

            <Link href="/network/events" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>

            <Link href="/network/pages" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
              <Newspaper className="h-5 w-5" />
              <span>Pages</span>
              <span className="ml-auto text-muted-foreground">12</span>
            </Link>

            <Link href="/network/newsletters" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md">
              <Newspaper className="h-5 w-5" />
              <span>Newsletters</span>
            </Link>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Connection Requests */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Connection Requests</h2>
              {connectionRequests.length > 0 ? (
                <div className="space-y-4">
                  {connectionRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      <Button onClick={() => handleAcceptConnection(request.id)}>Accept</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No pending connection requests</p>
                </div>
              )}
              </CardContent>
            </Card>

          {/* People You May Know */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">People You May Know</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-[200px] bg-muted animate-pulse rounded" />
                        <div className="h-3 w-[150px] bg-muted animate-pulse rounded" />
                        <div className="h-3 w-[100px] bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : networkUsers.length > 0 ? (
                <div className="space-y-4">
                  {networkUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.full_name?.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user.headline}</p>
                          <p className="text-xs text-muted-foreground mt-1">{user.title || 'Professional'}</p>
                        </div>
                      </div>
                      <Button onClick={() => handleConnect(user.id)}>Connect</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No new professionals to connect with at the moment.</p>
                  <p className="mt-2">Check back later for more connections!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* People You May Know */}
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">People you may know</h2>
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
                              >
                                Connect
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}