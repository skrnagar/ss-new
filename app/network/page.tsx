
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  MessageSquare, 
  Search, 
  Filter,
  Calendar,
  Newspaper,
  Building2,
  Globe,
  Sparkles,
  ArrowRight,
  Check,
  X,
  Clock,
  MapPin,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    headline?: string;
    avatar_url?: string;
    username: string;
    company?: string;
    location?: string;
  };
}

interface Suggestion {
  id: string;
  full_name: string;
  headline?: string;
  avatar_url?: string;
  username: string;
  company?: string;
  location?: string;
  mutual_connections: number;
}

export default function NetworkPage() {
  const { session } = useAuth();
  const user = session?.user;
  const { toast } = useToast();
  
  // State management
  const [connections, setConnections] = useState<Connection[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNetworkData();
    }
  }, [user]);

  const fetchNetworkData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // First fetch connections
      const connectionsData = await fetchConnections();
      setConnections(connectionsData);
      
      // Then fetch suggestions and requests in parallel
      const [suggestionsData, requestsData] = await Promise.all([
        fetchSuggestions(connectionsData),
        fetchRequests()
      ]);

      setSuggestions(suggestionsData);
      setReceivedRequests(requestsData.received);
      setSentRequests(requestsData.sent);
      
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

  const fetchConnections = async (): Promise<Connection[]> => {
    const [sentResponse, receivedResponse] = await Promise.all([
      supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_connected_user_id_fkey(
            id, full_name, headline, avatar_url, username, company, location
          )
        `)
        .eq("user_id", user?.id)
        .eq("status", "accepted"),
        
      supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_user_id_fkey(
            id, full_name, headline, avatar_url, username, company, location
          )
        `)
        .eq("connected_user_id", user?.id)
        .eq("status", "accepted")
    ]);

    if (sentResponse.error) throw sentResponse.error;
    if (receivedResponse.error) throw receivedResponse.error;

    const sentConnections = sentResponse.data || [];
    const receivedConnections = receivedResponse.data || [];

    // Combine and deduplicate connections
    const allConnections = [...sentConnections, ...receivedConnections];
    const uniqueConnections = allConnections.filter((conn, index, self) => 
      index === self.findIndex(c => 
        (c.user_id === conn.user_id && c.connected_user_id === conn.connected_user_id) ||
        (c.user_id === conn.connected_user_id && c.connected_user_id === conn.user_id)
      )
    );

    // Ensure all connections have proper profile data
    const validConnections = uniqueConnections.filter(conn => conn.profile);
    
    console.log('Fetched connections:', validConnections.length);
    console.log('Sample connection:', validConnections[0]);

    return validConnections;
  };

  const fetchSuggestions = async (connectionsData: Connection[]): Promise<Suggestion[]> => {
    // Get all connected user IDs
    const connectedUserIds = connectionsData.map(conn => 
      conn.user_id === user?.id ? conn.connected_user_id : conn.user_id
    );

    // Fetch users not connected
    const { data: suggestionData, error } = await supabase
      .from("profiles")
      .select("id, full_name, headline, avatar_url, username, company, location")
      .neq("id", user?.id)
      .not("id", "in", connectedUserIds.length > 0 ? `(${connectedUserIds.join(",")})` : "(0)")
      .limit(20);

    if (error) throw error;

    // Calculate mutual connections for each suggestion
    const suggestionsWithMutual = await Promise.all(
      (suggestionData || []).map(async (profile) => {
        const mutualCount = await calculateMutualConnections(profile.id, connectionsData);
        return {
          ...profile,
          mutual_connections: mutualCount
        };
      })
    );

    console.log('Fetched suggestions:', suggestionsWithMutual.length);

    return suggestionsWithMutual;
  };

  const fetchRequests = async () => {
    const [receivedResponse, sentResponse] = await Promise.all([
      supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_user_id_fkey(
            id, full_name, headline, avatar_url, username, company, location
          )
        `)
        .eq("connected_user_id", user?.id)
        .eq("status", "pending"),
        
      supabase
        .from("connections")
        .select(`
          *,
          profile:profiles!connections_connected_user_id_fkey(
            id, full_name, headline, avatar_url, username, company, location
          )
        `)
        .eq("user_id", user?.id)
        .eq("status", "pending")
    ]);

    if (receivedResponse.error) throw receivedResponse.error;
    if (sentResponse.error) throw sentResponse.error;

    const received = (receivedResponse.data || []).filter(req => req.profile);
    const sent = (sentResponse.data || []).filter(req => req.profile);

    console.log('Fetched requests - received:', received.length, 'sent:', sent.length);

    return {
      received,
      sent
    };
  };

  const calculateMutualConnections = async (profileId: string, connectionsData: Connection[]): Promise<number> => {
    try {
      // Get user's connections
      const userConnectionIds = connectionsData.map(conn => 
        conn.user_id === user?.id ? conn.connected_user_id : conn.user_id
      );

      // Get target user's connections
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

  // Action handlers
  const handleConnect = async (profileId: string) => {
    if (!user?.id) return;
    
    setProcessingAction(profileId);
    
    try {
      // Optimistic update
      const profile = suggestions.find(p => p.id === profileId);
      if (profile) {
        setSuggestions(prev => prev.filter(p => p.id !== profileId));
        setSentRequests(prev => [...prev, {
          id: `temp-${Date.now()}`,
          user_id: user.id,
          connected_user_id: profileId,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          profile: {
            id: profileId,
            full_name: profile.full_name,
            headline: profile.headline,
            avatar_url: profile.avatar_url,
            username: profile.username,
            company: profile.company,
            location: profile.location
          }
        }]);
      }

      const { error } = await supabase.from("connections").insert({
        user_id: user.id,
        connected_user_id: profileId,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Connection request sent!",
        description: "We'll notify you when they respond.",
      });

      // Refresh data
      await fetchNetworkData();
      
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
      
      // Revert optimistic update
      await fetchNetworkData();
    } finally {
      setProcessingAction(null);
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    setProcessingAction(connectionId);
    
    try {
      const { error } = await supabase
        .from("connections")
        .update({ status: "accepted" })
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Connection accepted! 🎉",
        description: "You are now connected.",
      });

      await fetchNetworkData();
      
    } catch (error) {
      console.error("Error accepting connection:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRejectConnection = async (connectionId: string) => {
    setProcessingAction(connectionId);
    
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Request declined",
        description: "Connection request has been declined.",
      });

      await fetchNetworkData();
      
    } catch (error) {
      console.error("Error rejecting connection:", error);
      toast({
        title: "Error",
        description: "Failed to decline connection",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancelRequest = async (connectionId: string) => {
    setProcessingAction(connectionId);
    
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Request cancelled",
        description: "Connection request has been cancelled.",
      });

      await fetchNetworkData();
      
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    setProcessingAction(connectionId);
    
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("id", connectionId);

      if (error) throw error;

      toast({
        title: "Connection removed",
        description: "Connection has been removed from your network.",
      });

      await fetchNetworkData();
      
    } catch (error) {
      console.error("Error removing connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(null);
    }
  };

  // Filter functions
  const filteredConnections = connections.filter(conn =>
    conn.profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.profile.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.profile.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-3 space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">Connect with professionals and grow your network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Network Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connections</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {connections.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Requests</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {receivedRequests.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sent Requests</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {sentRequests.length}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Link href="/network/connections" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <UserCheck className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">My Connections</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                  <Link href="/network/followers" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Following & Followers</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                  <Link href="/groups" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Groups</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                  <Link href="/events" className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Events</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="connections" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Connections
                    {connections.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                        {connections.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Requests
                    {(receivedRequests.length + sentRequests.length) > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                        {receivedRequests.length + sentRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="discover" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Discover
                  </TabsTrigger>
                </TabsList>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Connection Requests */}
                {receivedRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Connection Requests ({receivedRequests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {receivedRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={request.profile.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {request.profile.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{request.profile.full_name}</h3>
                                <p className="text-sm text-gray-600">{request.profile.headline}</p>
                                {request.profile.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3" />
                                    {request.profile.company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAcceptConnection(request.id)}
                                disabled={processingAction === request.id}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleRejectConnection(request.id)}
                                disabled={processingAction === request.id}
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recent Connections */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Recent Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {connections.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredConnections.slice(0, 6).map((connection) => (
                          <div key={connection.id} className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={connection.profile.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                {connection.profile.full_name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{connection.profile.full_name}</h3>
                              <p className="text-sm text-gray-600 truncate">{connection.profile.headline}</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/profile/${connection.profile.username}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No connections yet</p>
                        <p className="text-sm">Start connecting with other professionals!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Suggested Connections */}
                {suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        People You May Know
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredSuggestions.slice(0, 4).map((suggestion) => (
                          <div key={suggestion.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={suggestion.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {suggestion.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900">{suggestion.full_name}</h3>
                                <p className="text-sm text-gray-600">{suggestion.headline}</p>
                                {suggestion.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3" />
                                    {suggestion.company}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                  {suggestion.mutual_connections} mutual connections
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                onClick={() => handleConnect(suggestion.id)}
                                disabled={processingAction === suggestion.id}
                                size="sm"
                                className="flex-1"
                              >
                                {processingAction === suggestion.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                ) : (
                                  <UserPlus className="h-3 w-3 mr-2" />
                                )}
                                Connect
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/${suggestion.username}`}>
                                  View
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Connections Tab */}
              <TabsContent value="connections" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      My Connections ({connections.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {connections.length > 0 ? (
                      <div className="space-y-4">
                        {filteredConnections.map((connection) => (
                          <div key={connection.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.profile.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {connection.profile.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{connection.profile.full_name}</h3>
                                <p className="text-sm text-gray-600">{connection.profile.headline}</p>
                                {connection.profile.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3" />
                                    {connection.profile.company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/messages?userId=${connection.profile.id}`}>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Message
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/${connection.profile.username}`}>
                                  View Profile
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveConnection(connection.id)}
                                    className="text-red-600"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Remove Connection
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No connections yet</p>
                        <p className="text-sm">Start connecting with other professionals!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                {/* Received Requests */}
                {receivedRequests.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Received Requests ({receivedRequests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {receivedRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={request.profile.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {request.profile.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{request.profile.full_name}</h3>
                                <p className="text-sm text-gray-600">{request.profile.headline}</p>
                                {request.profile.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3" />
                                    {request.profile.company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleAcceptConnection(request.id)}
                                disabled={processingAction === request.id}
                                className="bg-primary hover:bg-primary/90"
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                Accept
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleRejectConnection(request.id)}
                                disabled={processingAction === request.id}
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Decline
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
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Sent Requests ({sentRequests.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sentRequests.map((request) => (
                          <div key={request.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={request.profile.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {request.profile.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{request.profile.full_name}</h3>
                                <p className="text-sm text-gray-600">{request.profile.headline}</p>
                                {request.profile.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3" />
                                    {request.profile.company}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Pending response</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => handleCancelRequest(request.id)}
                                disabled={processingAction === request.id}
                              >
                                {processingAction === request.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Cancel
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/profile/${request.profile.username}`}>
                                  View Profile
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {receivedRequests.length === 0 && sentRequests.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8 text-gray-500">
                      <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No pending requests</p>
                      <p className="text-sm">Check the Discover tab to find people to connect with!</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Discover Tab */}
              <TabsContent value="discover" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Discover People ({suggestions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {suggestions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSuggestions.map((suggestion) => (
                          <div key={suggestion.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3 mb-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={suggestion.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                                  {suggestion.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{suggestion.full_name}</h3>
                                <p className="text-sm text-gray-600 truncate">{suggestion.headline}</p>
                                {suggestion.company && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Briefcase className="h-3 w-3" />
                                    {suggestion.company}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Mutual connections</span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                  {suggestion.mutual_connections}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleConnect(suggestion.id)}
                                  disabled={processingAction === suggestion.id}
                                  className="flex-1"
                                  size="sm"
                                >
                                  {processingAction === suggestion.id ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                                  ) : (
                                    <UserPlus className="h-3 w-3 mr-2" />
                                  )}
                                  Connect
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/profile/${suggestion.username}`}>
                                    View
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No suggestions available</p>
                        <p className="text-sm">Try expanding your network to see more suggestions!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
