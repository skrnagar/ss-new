import { Card, CardContent } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="container max-w-6xl py-8 animate-pulse">
      <div className="h-48 bg-muted rounded-xl mb-8" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-4">
          <Card>
            <CardContent className="h-40 pt-6 bg-muted/40" />
          </Card>
          <Card>
            <CardContent className="h-56 pt-6 bg-muted/40" />
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="h-32 pt-6 bg-muted/40" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
