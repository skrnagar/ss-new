import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Briefcase, Clock, DollarSign, Building, Filter, BookmarkPlus } from "lucide-react"

export default function JobsPage() {
  const jobs = [
    {
      id: 1,
      title: "ESG Compliance Manager",
      company: "GreenTech Solutions",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$90,000 - $120,000",
      posted: "2 days ago",
      logo: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      title: "Health & Safety Specialist",
      company: "Industrial Innovations",
      location: "Chicago, IL",
      type: "Full-time",
      salary: "$75,000 - $95,000",
      posted: "3 days ago",
      logo: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      title: "Environmental Compliance Auditor",
      company: "EcoSystems Inc.",
      location: "Remote",
      type: "Contract",
      salary: "$85,000 - $110,000",
      posted: "1 week ago",
      logo: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      title: "Sustainability Program Manager",
      company: "Global Energy Partners",
      location: "New York, NY",
      type: "Full-time",
      salary: "$100,000 - $130,000",
      posted: "5 days ago",
      logo: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 5,
      title: "Occupational Health Specialist",
      company: "Healthcare Solutions",
      location: "Boston, MA",
      type: "Full-time",
      salary: "$80,000 - $105,000",
      posted: "3 days ago",
      logo: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 6,
      title: "Corporate Social Responsibility Lead",
      company: "Retail Innovations",
      location: "Austin, TX",
      type: "Full-time",
      salary: "$95,000 - $125,000",
      posted: "1 day ago",
      logo: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Job Portal</h1>
          <p className="text-muted-foreground">Find specialized ESG and EHS career opportunities</p>
        </div>
        <Button variant="secondary">
          <Briefcase className="mr-2 h-4 w-4" />
          Post a Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search for jobs, companies, or keywords..." className="pl-10" />
          </div>
        </div>
        <div>
          <Button variant="outline" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            Filter Jobs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-primary/5 rounded-md flex items-center justify-center">
                    <img
                      src={job.logo || "/placeholder.svg"}
                      alt={`${job.company} logo`}
                      className="max-w-full max-h-full p-2"
                    />
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-1">{job.title}</h3>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="mr-4">{job.company}</span>
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {job.type}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {job.salary}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Posted {job.posted}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="secondary">Apply Now</Button>
                    <Button variant="outline">
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Save Job
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

