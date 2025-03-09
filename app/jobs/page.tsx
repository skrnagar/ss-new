"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  Briefcase,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Filter,
  MapPin,
  Search,
} from "lucide-react";
import { useState } from "react";

export default function JobsPage() {
  const [jobs] = useState([
    {
      id: 1,
      title: "ESG Compliance Manager",
      company: "GreenTech Solutions",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      posted: "3 days ago",
      description:
        "Leading our ESG compliance initiatives and ensuring all regulatory requirements are met.",
      tags: ["ESG", "Compliance", "Management"],
    },
    {
      id: 2,
      title: "Occupational Health & Safety Specialist",
      company: "Safety First Industries",
      location: "Chicago, IL",
      type: "Full-time",
      salary: "$75,000 - $95,000",
      posted: "1 week ago",
      description:
        "Developing and implementing comprehensive health and safety programs for industrial operations.",
      tags: ["EHS", "OSHA", "Risk Assessment"],
    },
    {
      id: 3,
      title: "Environmental Impact Consultant",
      company: "Sustainable Future Consulting",
      location: "Remote",
      type: "Contract",
      salary: "$65/hr",
      posted: "2 days ago",
      description:
        "Conducting environmental impact assessments and providing recommendations for mitigation strategies.",
      tags: ["Environmental", "Consulting", "Impact Assessment"],
    },
    {
      id: 4,
      title: "Corporate Social Responsibility Manager",
      company: "Global Enterprises Inc.",
      location: "New York, NY",
      type: "Full-time",
      salary: "$110,000 - $140,000",
      posted: "5 days ago",
      description:
        "Leading our CSR initiatives and developing strategies to enhance our social impact.",
      tags: ["CSR", "Social Impact", "ESG"],
    },
  ]);

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">ESG & EHS Job Board</h1>
          <p className="text-muted-foreground">
            Find your next opportunity in Environmental, Social, Governance, and Safety
          </p>
        </div>
        <Button>
          <Briefcase className="mr-2 h-4 w-4" />
          Post a Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search jobs by title, company, or keywords..." className="pl-10" />
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter Jobs
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">Showing {jobs.length} jobs</div>
        <Button variant="ghost" size="sm">
          <ArrowUpDown className="mr-2 h-4 w-4" />
          Sort by: Newest
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Card key={job.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                  <div className="bg-muted rounded-md p-4 mb-4 md:mb-0">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <div className="mt-2 md:mt-0 text-sm">
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <Building className="h-4 w-4 mr-1" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-1">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Posted {job.posted}</span>
                      </div>
                    </div>
                    <p className="mt-4 text-muted-foreground">{job.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted p-6 flex flex-col justify-center md:border-l">
                <Button className="w-full mb-2">Apply Now</Button>
                <Button variant="outline" className="w-full">
                  Save Job
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" size="lg">
          Load More Jobs
        </Button>
      </div>
    </div>
  );
}
