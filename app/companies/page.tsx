"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth-context";
import { Building, Search, Plus, Users, MapPin, TrendingUp, Briefcase } from "lucide-react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logo_url?: string;
  industry?: string;
  headquarters_location?: string;
  employee_count: number;
  follower_count: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "following">("all");
  const { session } = useAuth();

  useEffect(() => {
    fetchCompanies();
  }, [filter]);

  const fetchCompanies = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("companies")
        .select("*")
        .order("follower_count", { ascending: false });

      if (filter === "following" && session?.user?.id) {
        const { data: followedCompanies } = await supabase
          .from("company_followers")
          .select("company_id")
          .eq("user_id", session.user.id);

        if (followedCompanies && followedCompanies.length > 0) {
          const companyIds = followedCompanies.map((f) => f.company_id);
          query = query.in("id", companyIds);
        } else {
          setCompanies([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="h-8 w-8 text-primary" />
                Companies
              </h1>
              <p className="text-gray-600 mt-1">
                Discover and follow professional organizations
              </p>
            </div>
            {session && (
              <Button asChild>
                <Link href="/companies/create" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Company Page
                </Link>
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                size="sm"
              >
                All Companies
              </Button>
              {session && (
                <Button
                  variant={filter === "following" ? "default" : "outline"}
                  onClick={() => setFilter("following")}
                  size="sm"
                >
                  Following
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "No companies found" : "No companies yet"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Be the first to create a company page"}
              </p>
              {session && !searchQuery && (
                <Button asChild>
                  <Link href="/companies/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Company Page
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <Link key={company.id} href={`/companies/${company.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-16 w-16 rounded-lg">
                        <AvatarImage src={company.logo_url || ""} alt={company.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg rounded-lg">
                          {company.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-primary transition-colors">
                          {company.name}
                        </h3>
                        {company.tagline && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {company.tagline}
                          </p>
                        )}
                      </div>
                    </div>

                    {company.industry && (
                      <Badge variant="secondary" className="mb-3">
                        {company.industry}
                      </Badge>
                    )}

                    {company.headquarters_location && (
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        {company.headquarters_location}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-4 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{company.employee_count} employees</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{company.follower_count} followers</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

