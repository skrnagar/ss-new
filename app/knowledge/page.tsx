"use client";

import { ResourcePreviewModal } from "@/components/knowledge/resource-preview-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SchemaSetupCard } from "@/components/schema-setup-card";
import {
  CATEGORIES,
  FILE_TYPES,
  INDUSTRIES,
  type KnowledgeResource,
  formatFileSize,
  getExpiryState,
  getFileIcon,
  getFileTypeGroup,
  getFileTypeLabel,
  isKnowledgeResourcesSchemaMissing,
  labelForCategory,
  labelForIndustry,
  timeAgo,
} from "@/lib/knowledge-utils";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Eye,
  Filter,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

type SortOption = "recent" | "popular" | "title";
type DateFilter = "all" | "week" | "month" | "quarter";

export default function KnowledgePage() {
  const { toast } = useToast();
  const [resources, setResources] = React.useState<KnowledgeResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorState, setErrorState] = React.useState<string | null>(null);
  const [schemaSetupNeeded, setSchemaSetupNeeded] = React.useState(false);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    null
  );
  const [selectedIndustries, setSelectedIndustries] = React.useState<string[]>(
    []
  );
  const [selectedFileTypes, setSelectedFileTypes] = React.useState<string[]>(
    []
  );
  const [dateFilter, setDateFilter] = React.useState<DateFilter>("all");
  const [sort, setSort] = React.useState<SortOption>("recent");
  const [showFilters, setShowFilters] = React.useState(false);

  const [previewResource, setPreviewResource] =
    React.useState<KnowledgeResource | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchResources = React.useCallback(async () => {
    setLoading(true);
    setErrorState(null);
    setSchemaSetupNeeded(false);
    try {
      let query = supabase
        .from("knowledge_resources")
        .select("*")
        .eq("status", "approved");

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (selectedIndustries.length > 0) {
        query = query.in("industry", selectedIndustries);
      }

      if (debouncedSearch) {
        const escaped = debouncedSearch.replace(/[%,]/g, " ");
        query = query.or(
          `title.ilike.%${escaped}%,description.ilike.%${escaped}%`
        );
      }

      if (dateFilter !== "all") {
        const days = dateFilter === "week" ? 7 : dateFilter === "month" ? 30 : 90;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte("created_at", since.toISOString());
      }

      if (sort === "popular") {
        query = query.order("download_count", { ascending: false });
      } else if (sort === "title") {
        query = query.order("title", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      query = query.limit(60);

      const { data, error } = await query;

      if (error) {
        if (isKnowledgeResourcesSchemaMissing(error)) {
          setSchemaSetupNeeded(true);
          setResources([]);
          return;
        }
        throw error;
      }

      let filtered = (data || []) as KnowledgeResource[];

      if (selectedFileTypes.length > 0) {
        const set = new Set(selectedFileTypes);
        filtered = filtered.filter((r) => {
          const group = getFileTypeGroup(r.file_type, r.file_name);
          return set.has(group);
        });
      }

      setResources(filtered);
    } catch (err: any) {
      console.error("Error loading knowledge resources:", err);
      setSchemaSetupNeeded(false);
      setErrorState(err?.message || "Failed to load resources.");
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    selectedCategory,
    selectedIndustries,
    selectedFileTypes,
    dateFilter,
    sort,
  ]);

  React.useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const handleDownload = React.useCallback(
    async (resource: KnowledgeResource) => {
      const url = resource.file_url || resource.external_url;
      if (!url) {
        toast({
          title: "No file available",
          description: "This resource has no downloadable file.",
          variant: "destructive",
        });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");

      try {
        await supabase.rpc("increment_knowledge_download", {
          resource_id: resource.id,
        });
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id
              ? { ...r, download_count: (r.download_count ?? 0) + 1 }
              : r
          )
        );
      } catch {
        // RPC may not exist yet — fail silently, download already started.
      }
    },
    [toast]
  );

  const toggleArrayValue = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    if (list.includes(value)) setter(list.filter((v) => v !== value));
    else setter([...list, value]);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedIndustries([]);
    setSelectedFileTypes([]);
    setDateFilter("all");
    setSearchTerm("");
    setSort("recent");
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    selectedIndustries.length +
    selectedFileTypes.length +
    (dateFilter !== "all" ? 1 : 0);

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Center</h1>
          <p className="text-muted-foreground mt-1">
            EHS, ESG, fire safety, compliance, audit, training & environmental
            resources contributed by the community.
          </p>
        </div>
        <Button asChild className="bg-secondary text-white">
          <Link href="/knowledge/contribute">
            <Upload className="h-4 w-4 mr-2" />
            Contribute Resource
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar — categories + filters */}
        <aside
          className={`lg:col-span-3 space-y-6 ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant={!selectedCategory ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setSelectedCategory(null)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                All Resources
              </Button>
              {CATEGORIES.map((c) => (
                <Button
                  key={c.value}
                  variant={selectedCategory === c.value ? "secondary" : "ghost"}
                  className="w-full justify-start font-normal"
                  onClick={() => setSelectedCategory(c.value)}
                >
                  {c.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={clearFilters}
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear ({activeFilterCount})
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="text-sm font-medium mb-2">Industry</div>
                <div className="space-y-2 max-h-56 overflow-auto pr-1">
                  {INDUSTRIES.map((i) => (
                    <label
                      key={i.value}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIndustries.includes(i.value)}
                        onCheckedChange={() =>
                          toggleArrayValue(
                            i.value,
                            selectedIndustries,
                            setSelectedIndustries
                          )
                        }
                      />
                      <span>{i.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">File Type</div>
                <div className="space-y-2">
                  {FILE_TYPES.map((f) => (
                    <label
                      key={f.value}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedFileTypes.includes(f.value)}
                        onCheckedChange={() =>
                          toggleArrayValue(
                            f.value,
                            selectedFileTypes,
                            setSelectedFileTypes
                          )
                        }
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Date Added</div>
                <Tabs
                  value={dateFilter}
                  onValueChange={(v) => setDateFilter(v as DateFilter)}
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="week">7d</TabsTrigger>
                    <TabsTrigger value="month">30d</TabsTrigger>
                    <TabsTrigger value="quarter">90d</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main */}
        <section className="lg:col-span-9 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources by title or description..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  className="lg:hidden"
                  onClick={() => setShowFilters((v) => !v)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide filters" : "Filters"}
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                <Select
                  value={sort}
                  onValueChange={(v) => setSort(v as SortOption)}
                >
                  <SelectTrigger className="md:w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Downloaded</SelectItem>
                    <SelectItem value="title">Title (A–Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {labelForCategory(selectedCategory)}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        aria-label="Remove category filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedIndustries.map((i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {labelForIndustry(i)}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIndustries((prev) =>
                            prev.filter((v) => v !== i)
                          )
                        }
                        aria-label={`Remove ${i} filter`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {selectedFileTypes.map((f) => (
                    <Badge key={f} variant="secondary" className="gap-1">
                      {FILE_TYPES.find((x) => x.value === f)?.label || f}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFileTypes((prev) =>
                            prev.filter((v) => v !== f)
                          )
                        }
                        aria-label={`Remove ${f} filter`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {schemaSetupNeeded ? (
            <SchemaSetupCard
              title="Knowledge Center needs a one-time database setup"
              description="The knowledge_resources table is not in your Supabase project yet, so resources cannot load."
              scriptHint="lib/production/01-knowledge-tables.sql"
              onRefresh={fetchResources}
            />
          ) : errorState ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {errorState}
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="py-16 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center space-y-3">
                <BookOpen className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="font-medium">No resources found</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Try clearing your filters, or be the first to contribute a
                  resource in this category.
                </p>
                <Button asChild>
                  <Link href="/knowledge/contribute">
                    <Upload className="h-4 w-4 mr-2" />
                    Contribute a Resource
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {resources.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onPreview={() => setPreviewResource(r)}
                  onDownload={() => handleDownload(r)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <ResourcePreviewModal
        resource={previewResource}
        open={previewResource !== null}
        onOpenChange={(open) => !open && setPreviewResource(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}

function ResourceCard({
  resource,
  onPreview,
  onDownload,
}: {
  resource: KnowledgeResource;
  onPreview: () => void;
  onDownload: () => void;
}) {
  const Icon = getFileIcon(resource.file_type, resource.file_name);
  const expiry = getExpiryState(resource.expires_at);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="bg-primary/10 p-2 rounded-md w-fit">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col items-end gap-1">
            {expiry.kind === "expired" && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
            {expiry.kind === "expiring-soon" && (
              <Badge className="text-xs bg-amber-500 hover:bg-amber-600">
                Expires in {expiry.daysLeft}d
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-base leading-snug line-clamp-2">
          {resource.title}
        </CardTitle>
        {resource.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {resource.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pb-3 flex-1 flex flex-col">
        <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0">
              <span className="truncate">
                {getFileTypeLabel(resource.file_type, resource.file_name)}
                {resource.file_size != null &&
                  ` • ${formatFileSize(resource.file_size)}`}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Download className="h-3 w-3" />
              <span>{resource.download_count ?? 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeAgo(resource.created_at)}</span>
          </div>
          {resource.expires_at && expiry.kind !== "none" && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>
                Expires{" "}
                {new Date(resource.expires_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">
            {labelForCategory(resource.category)}
          </Badge>
          {resource.industry && (
            <Badge variant="outline" className="text-xs">
              {labelForIndustry(resource.industry)}
            </Badge>
          )}
          {resource.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onPreview}
            disabled={!resource.file_url && !resource.external_url}
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onDownload}
            disabled={!resource.file_url && !resource.external_url}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
