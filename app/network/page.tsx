
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
  const [suggestions, setSuggestions] = useState<any[]>([]);
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

      // Fetch connection suggestions
      const { data: suggestionData } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(5);

      setConnections(connectionData || []);
      setSuggestions(suggestionData || []);
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
        <div className="md:col-span-3">
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
