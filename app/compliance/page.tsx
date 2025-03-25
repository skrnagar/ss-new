"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";
import { useState } from "react";

export default function CompliancePage() {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleSection = (index: number) => {
    if (expandedSection === index) {
      setExpandedSection(null);
    } else {
      setExpandedSection(index);
    }
  };

  const complianceAreas = [
    {
      id: 1,
      name: "Environmental Compliance",
      status: "compliant",
      lastAudit: "15 May 2023",
      nextAudit: "15 Nov 2023",
      items: [
        { name: "Emissions Reporting", status: "compliant", dueDate: "30 Oct 2023" },
        { name: "Waste Management Plan", status: "compliant", dueDate: "15 Dec 2023" },
        { name: "Water Usage Monitoring", status: "compliant", dueDate: "01 Nov 2023" },
        { name: "Environmental Impact Assessment", status: "compliant", dueDate: "15 Jan 2024" },
      ],
    },
    {
      id: 2,
      name: "Health & Safety",
      status: "at-risk",
      lastAudit: "10 Jun 2023",
      nextAudit: "10 Dec 2023",
      items: [
        { name: "Emergency Response Plan", status: "compliant", dueDate: "15 Nov 2023" },
        { name: "Safety Training Records", status: "at-risk", dueDate: "30 Oct 2023" },
        { name: "Incident Reporting System", status: "compliant", dueDate: "01 Dec 2023" },
        { name: "PPE Compliance Audit", status: "non-compliant", dueDate: "15 Oct 2023" },
      ],
    },
    {
      id: 3,
      name: "Social Responsibility",
      status: "compliant",
      lastAudit: "20 Jul 2023",
      nextAudit: "20 Jan 2024",
      items: [
        { name: "Diversity & Inclusion Policy", status: "compliant", dueDate: "01 Dec 2023" },
        { name: "Community Engagement Report", status: "compliant", dueDate: "15 Jan 2024" },
        { name: "Labor Rights Compliance", status: "compliant", dueDate: "30 Nov 2023" },
        { name: "Ethical Supply Chain Audit", status: "compliant", dueDate: "15 Feb 2024" },
      ],
    },
    {
      id: 4,
      name: "Governance",
      status: "non-compliant",
      lastAudit: "05 Aug 2023",
      nextAudit: "05 Feb 2024",
      items: [
        { name: "Anti-Corruption Policy", status: "compliant", dueDate: "15 Dec 2023" },
        { name: "Board Diversity Assessment", status: "compliant", dueDate: "30 Jan 2024" },
        { name: "Executive Compensation Review", status: "non-compliant", dueDate: "01 Oct 2023" },
        {
          name: "Whistleblower Protection Program",
          status: "non-compliant",
          dueDate: "15 Nov 2023",
        },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "at-risk":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "non-compliant":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-50 text-green-700 border-green-200";
      case "at-risk":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "non-compliant":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "compliant":
        return "Compliant";
      case "at-risk":
        return "At Risk";
      case "non-compliant":
        return "Non-Compliant";
      default:
        return "";
    }
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your ESG compliance requirements
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Alerts
          </Button>
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            New Audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Compliant Areas</p>
                <h3 className="text-2xl font-bold text-green-800">2</h3>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">At-Risk Areas</p>
                <h3 className="text-2xl font-bold text-amber-800">1</h3>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Non-Compliant Areas</p>
                <h3 className="text-2xl font-bold text-red-800">1</h3>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Upcoming Audits</p>
                <h3 className="text-2xl font-bold">3</h3>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {complianceAreas.map((area, index) => (
          <Card key={area.id} className={`border-l-4 ${getStatusClass(area.status)}`}>
            <CardHeader className="p-6 pb-0">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(index)}
                onKeyDown={(e) => e.key === "Enter" && toggleSection(index)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(area.status)}
                  <h3 className="font-semibold text-lg">{area.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(area.status)}`}>
                    {getStatusText(area.status)}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 mr-1" />
                      <span>Last Audit: {area.lastAudit}</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Next Audit: {area.nextAudit}</span>
                    </div>
                  </div>
                  {expandedSection === index ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedSection === index && (
              <CardContent className="p-6">
                <div className="md:hidden mb-4 space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Last Audit: {area.lastAudit}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Next Audit: {area.nextAudit}</span>
                  </div>
                </div>

                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Compliance Item
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Due Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {area.items.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}
                            >
                              {getStatusIcon(item.status)}
                              <span className="ml-1">{getStatusText(item.status)}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.dueDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
