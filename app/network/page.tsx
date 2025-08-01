
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
import { FullScreenLoader } from "@/components/ui/logo-loder";
import useSWR from 'swr';

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
  const { session, isLoading: authLoading } = useAuth();
  const user = session?.user;
  const { toast } = useToast();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const fetchConnections = async (userId: string): Promise<Connection[]> => {
    const [sentResponse, receivedResponse] = await Promise.all([
      supabase
        .from("connections")
        .select(`*,profile:profiles!connections_connected_user_id_fkey(id, full_name, headline, avatar_url, username, company, location)`)
        .eq("user_id", userId)
        .eq("status", "accepted"),
      supabase
        .from("connections")
        .select(`*,profile:profiles!connections_user_id_fkey(id, full_name, headline, avatar_url, username, company, location)`)
        .eq("connected_user_id", userId)
        .eq("status", "accepted")
    ]);
    if (sentResponse.error) throw sentResponse.error;
    if (receivedResponse.error) throw receivedResponse.error;
    const sentConnections = sentResponse.data || [];
    const receivedConnections = receivedResponse.data || [];
    const allConnections = [...sentConnections, ...receivedConnections];
    const uniqueConnections = allConnections.filter((conn, index, self) =>
      index === self.findIndex(c =>
        (c.user_id === conn.user_id && c.connected_user_id === conn.connected_user_id) ||
        (c.user_id === conn.connected_user_id && c.connected_user_id === conn.user_id)
      )
    );
    return uniqueConnections.filter(conn => conn.profile);
  };

  const fetchRequests = async (userId: string): Promise<{received: Connection[]; sent: Connection[]}> => {
    const [receivedResponse, sentResponse] = await Promise.all([
      supabase
        .from("connections")
        .select(`*,profile:profiles!connections_user_id_fkey(id, full_name, headline, avatar_url, username, company, location)`)
        .eq("connected_user_id", userId)
        .eq("status", "pending"),
      supabase
        .from("connections")
        .select(`*,profile:profiles!connections_connected_user_id_fkey(id, full_name, headline, avatar_url, username, company, location)`)
        .eq("user_id", userId)
        .eq("status", "pending")
    ]);
    if (receivedResponse.error) throw receivedResponse.error;
    if (sentResponse.error) throw sentResponse.error;
    return {
      received: (receivedResponse.data || []).filter(req => req.profile),
      sent: (sentResponse.data || []).filter(req => req.profile)
    };
  };

  const fetchSuggestions = async (userId: string, connections: Connection[]): Promise<Suggestion[]> => {
    const { data: allConnections, error: connError } = await supabase
      .from("connections")
      .select("user_id, connected_user_id")
      .or(`user_id.eq.${userId},connected_user_id.eq.${userId}`)
      .in("status", ["pending", "accepted"]);
    if (connError) throw connError;
    const connectedUserIds = new Set();
    (allConnections || []).forEach(conn => {
      if (conn.user_id === userId) connectedUserIds.add(conn.connected_user_id);
      else if (conn.connected_user_id === userId) connectedUserIds.add(conn.user_id);
    });
    const { data: suggestionData, error } = await supabase
      .from("profiles")
      .select("id, full_name, headline, avatar_url, username, company, location")
      .neq("id", userId)
      .not("id", "in", connectedUserIds.size > 0 ? `(${Array.from(connectedUserIds).join(",")})` : "(0)")
      .limit(20);
    if (error) throw error;
    // Calculate mutual connections for each suggestion
    const suggestionsWithMutual = await Promise.all(
      (suggestionData || []).map(async (profile) => {
        const mutualCount = await calculateMutualConnections(profile.id, connections);
        return {
          ...profile,
          mutual_connections: mutualCount
        };
      })
    );
    return suggestionsWithMutual;
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

  const {
    data: connections = [],
    isLoading: loadingConnections,
    mutate: mutateConnections
  } = useSWR(user && user.id ? ["connections", user.id] : null, () => fetchConnections(user!.id));

  const {
    data: requests = { received: [], sent: [] },
    isLoading: loadingRequests,
    mutate: mutateRequests
  } = useSWR(user && user.id ? ["requests", user.id] : null, () => fetchRequests(user!.id));

  const {
    data: suggestions = [],
    isLoading: loadingSuggestions,
    mutate: mutateSuggestions
  } = useSWR(user && user.id && connections ? ["suggestions", user.id, connections] : null, () => fetchSuggestions(user!.id, connections));

  const loading = authLoading || loadingConnections || loadingRequests || loadingSuggestions;

  // Action handlers
  const handleConnect = async (profileId: string) => {
    if (!user?.id) return;
    
    setProcessingAction(profileId);
    
    try {
      // Optimistic update
      const profile = suggestions.find(p => p.id === profileId);
      if (profile) {
        mutateSuggestions(); // Update suggestions
        mutateRequests(); // Update requests
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
      await mutateConnections();
      await mutateRequests();
      await mutateSuggestions();
      
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
      
      // Revert optimistic update
      await mutateConnections();
      await mutateRequests();
      await mutateSuggestions();
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

      await mutateConnections();
      await mutateRequests();
      await mutateSuggestions();
      
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

      await mutateConnections();
      await mutateRequests();
      await mutateSuggestions();
      
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

      await mutateConnections();
      await mutateRequests();
      await mutateSuggestions();
      
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

      await mutateConnections();
      await mutateRequests();
      await mutateSuggestions();
      
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

  if (authLoading) {
    return <FullScreenLoader variant="morph" text="Loading Network..." />;
  }

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
                    <span className="text-sm text-gray-600">Invitations</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {requests.received.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending Requests</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {requests.received.length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sent Requests</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {requests.sent.length}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="w-full overflow-x-auto scrollbar-hide">
                  <TabsList className="flex w-max min-w-full gap-2">
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
                      {(requests.received.length + requests.sent.length) > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                          {requests.received.length + requests.sent.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="discover" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Discover
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search people..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                </div>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
          {/* Connection Requests */}
                {requests.received.length > 0 && (
            <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Connection Requests ({requests.received.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                <div className="space-y-4">
                        {requests.received.map((request) => (
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
                {requests.received.length > 0 && (
            <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Received Requests ({requests.received.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {requests.received.map((request) => (
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
                {requests.sent.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Sent Requests ({requests.sent.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {requests.sent.map((request) => (
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

                {requests.received.length === 0 && requests.sent.length === 0 && (
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
                      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {filteredSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.id}
                            className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 p-4 sm:p-6 flex flex-col items-center text-center overflow-hidden min-w-0"
                          >
                            <div className="relative mb-3 sm:mb-4">
                              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shadow-xl ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
                                <AvatarImage src={suggestion.avatar_url} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-xl sm:text-2xl">
                                  {suggestion.full_name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-2 right-0 bg-primary text-white text-xs px-2 sm:px-3 py-1 rounded-full shadow-md font-semibold opacity-90">
                                {suggestion.mutual_connections} mutual
                              </div>
                            </div>
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1 truncate w-full">{suggestion.full_name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{suggestion.headline}</p>
                            {suggestion.company && (
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-1">
                                <Briefcase className="h-4 w-4" />
                                <span className="truncate max-w-[90px] sm:max-w-[120px]">{suggestion.company}</span>
                              </div>
                            )}
                            {suggestion.location && (
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate max-w-[90px] sm:max-w-[120px]">{suggestion.location}</span>
                              </div>
                            )}
                            <div className="flex flex-col gap-2 mt-3 sm:mt-4 w-full">
                              <Button
                                onClick={() => handleConnect(suggestion.id)}
                                disabled={processingAction === suggestion.id}
                                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md group-hover:scale-105 transition-transform duration-200 text-sm sm:text-base h-10 sm:h-12"
                                size="lg"
                              >
                                {processingAction === suggestion.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                ) : (
                                  <UserPlus className="h-4 w-4 mr-2" />
                                )}
                                Connect
                              </Button>
                              <Button variant="outline" size="sm" asChild className="w-full text-xs sm:text-sm h-9 sm:h-10">
                                <Link href={`/profile/${suggestion.username}`}>View Profile</Link>
                              </Button>
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
