import { Card, CardContent } from "@/components/ui/card";

export default function KnowledgeLoading() {
  return (
    <div className="container py-6 animate-pulse">
      <div className="h-10 w-64 bg-muted rounded-md mb-2" />
      <div className="h-4 w-96 bg-muted rounded-md mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="h-48 pt-6 bg-muted/30" />
          </Card>
          <Card>
            <CardContent className="h-64 pt-6 bg-muted/30" />
          </Card>
        </div>
        <div className="lg:col-span-9 space-y-4">
          <Card>
            <CardContent className="h-24 pt-6 bg-muted/30" />
          </Card>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="h-48 pt-6 bg-muted/30" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
