
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Award, Users, Video, Book } from "lucide-react";

export default function LearningPage() {
  const courses = [
    {
      title: "OSHA Compliance Training",
      category: "Safety",
      level: "Intermediate",
      duration: "20 hours",
      enrolled: 1234,
      certification: "OSHA Certified",
      type: "Self-paced",
      examInfo: "Final certification exam included"
    },
    {
      title: "ISO 45001 Fundamentals",
      category: "Certification",
      level: "Advanced",
      duration: "40 hours",
      enrolled: 856,
      certification: "ISO Certified",
      type: "Instructor-led",
      examInfo: "Monthly certification exams"
    },
    {
      title: "Fire Safety & Prevention",
      category: "Safety",
      level: "Beginner",
      duration: "15 hours",
      enrolled: 2100,
      certification: "Fire Safety Certified",
      type: "Self-paced",
      examInfo: "Includes practical assessment"
    },
    {
      title: "NEBOSH General Certificate",
      category: "Certification",
      level: "Advanced",
      duration: "120 hours",
      enrolled: 450,
      certification: "NEBOSH IGC",
      type: "Instructor-led",
      examInfo: "Written exam and practical assessment"
    },
    {
      title: "Chemical Handling Safety",
      category: "Hazmat",
      level: "Intermediate",
      duration: "25 hours",
      enrolled: 780,
      certification: "HAZMAT Certified",
      type: "Blended",
      examInfo: "Theory and practical certification"
    },
    {
      title: "ESG Compliance & Reporting",
      category: "ESG",
      level: "Advanced",
      duration: "30 hours",
      enrolled: 920,
      certification: "ESG Professional",
      type: "Self-paced",
      examInfo: "Case study based assessment"
    }
  ];

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Learning Center</h1>
          <p className="text-muted-foreground mt-1">
            Enhance your ESH & ESG knowledge with industry-recognized courses
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <div className="sticky top-20">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search courses..." className="pl-9" />
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full flex flex-col space-y-1">
                <TabsTrigger value="all" className="w-full justify-start">All Courses</TabsTrigger>
                <TabsTrigger value="safety" className="w-full justify-start">Safety Training</TabsTrigger>
                <TabsTrigger value="certification" className="w-full justify-start">Certifications</TabsTrigger>
                <TabsTrigger value="environmental" className="w-full justify-start">Environmental</TabsTrigger>
                <TabsTrigger value="hazmat" className="w-full justify-start">Hazardous Materials</TabsTrigger>
                <TabsTrigger value="esg" className="w-full justify-start">ESG</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="md:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>Level: {course.level}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      {course.type === "Self-paced" ? (
                        <Book className="h-4 w-4 mr-2" />
                      ) : (
                        <Video className="h-4 w-4 mr-2" />
                      )}
                      <span>{course.type}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{course.enrolled.toLocaleString()} enrolled</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Award className="h-4 w-4 mr-2" />
                      <span>{course.certification}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {course.examInfo}
                    </div>
                    <Button className="w-full mt-4">Enroll Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
