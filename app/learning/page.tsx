"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Clock, Award, Users, Video, Book, Library, Briefcase, TrendingUp, Bookmark, ScrollText } from "lucide-react";

export default function LearningPage() {
  const categories = [
    {
      title: "Cybersecurity",
      icon: "🔒",
      description: "Learn to protect information systems and data",
      color: "bg-red-100"
    },
    {
      title: "Business Intelligence",
      icon: "📊",
      description: "Master data-driven decision making",
      color: "bg-yellow-100"
    },
    {
      title: "Advanced Data Analytics",
      icon: "📈",
      description: "Analyze and interpret complex data sets",
      color: "bg-green-100"
    },
    {
      title: "Safety Management",
      icon: "⚠️",
      description: "Implement effective safety protocols",
      color: "bg-blue-100"
    }
  ];

  const courses = [
    {
      title: "OSHA Safety Leadership",
      duration: "40m",
      instructor: "Anna Smith",
      image: "/placeholder.jpg",
      tag: "Popular"
    },
    {
      title: "ESG Compliance Fundamentals",
      duration: "1h 5m",
      instructor: "John Miller",
      image: "/placeholder.jpg",
      tag: "New"
    },
    {
      title: "Workplace Risk Assessment",
      duration: "32m",
      instructor: "Sarah Johnson",
      image: "/placeholder.jpg",
      tag: "Popular"
    }
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learn job-ready skills with Safter Career Certificates</h1>

        {/* Categories Carousel */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {categories.map((category, index) => (
            <Card key={index} className={`flex-shrink-0 w-[300px] cursor-pointer hover:shadow-md transition-shadow ${category.color}`}>
              <CardContent className="p-4">
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold mb-1">{category.title}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <Button className="mt-4" variant="secondary">Learn more</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start">
              <Award className="mr-2 h-4 w-4" />
              Certifications
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Library className="mr-2 h-4 w-4" />
              My Library
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <ScrollText className="mr-2 h-4 w-4" />
              My Journey
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending topics
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">This week's top courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video relative bg-muted">
                    <Badge className="absolute top-2 right-2">{course.tag}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{course.title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <span>{course.instructor}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}