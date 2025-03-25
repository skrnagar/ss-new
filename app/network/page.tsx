
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container py-6 space-y-6">
      <Tabs defaultValue="grow" className="w-full">
        <TabsList>
          <TabsTrigger value="grow">Grow</TabsTrigger>
          <TabsTrigger value="connections">My Network</TabsTrigger>
        </TabsList>

        <TabsContent value="grow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>People you may know</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((profile) => (
                  <Card key={profile.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{profile.full_name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{profile.headline}</p>
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
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Connections ({connections.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {connections.map((connection) => (
                  <div key={connection.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.profile.avatar_url} />
                      <AvatarFallback>{getInitials(connection.profile.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{connection.profile.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{connection.profile.headline}</p>
                    </div>
                    <Button variant="secondary" size="sm">Message</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
