import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuditsHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-10">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Professional audits</h1>
        <p className="text-muted-foreground mb-8">
          Book verified auditors, run digital checklists with evidence, and leave structured reviews after
          engagements.
        </p>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                Find auditors nearby
              </CardTitle>
              <CardDescription>
                Map view uses Google Maps when <code className="text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
                is set. Profile pins use server geocoding (
                <code className="text-xs">GOOGLE_MAPS_GEOCODING_KEY</code>).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/audits/find">Open directory</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                My bookings
              </CardTitle>
              <CardDescription>Track status, checklists, evidence, and reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/audits/my-bookings">View bookings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                For auditors
              </CardTitle>
              <CardDescription>
                Set your profile role to <strong>auditor</strong>, then request platform verification from
                profile edit. Database setup: <code className="text-xs">npm run db:bootstrap</code> (includes{" "}
                <code className="text-xs">lib/production/03-phase4-audit.sql</code>).
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Admins approve auditor verification under User Management. Only approved auditors accept new
              booking requests.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
