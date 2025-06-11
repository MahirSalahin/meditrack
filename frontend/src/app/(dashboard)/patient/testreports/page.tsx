"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Download, Search, Eye, Calendar, FileText } from "lucide-react"
import { useTestReports } from "@/lib/api/services/patient/reports.service"
import TitleHeader from "@/components/title-header"

export default function TestReportsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const { data: reports, isLoading } = useTestReports()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "pending":
                return "bg-yellow-100 text-yellow-800"
            case "scheduled":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TitleHeader
                    title="Test Reports"
                    description="View and manage your laboratory and diagnostic test results"
                />
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    reports?.map((report) => (
                        <Card key={report.id} className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                            <h3 className="font-semibold">{report.testName}</h3>
                                            <Badge className={getStatusColor(report.status)}>
                                                {report.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Ordered by: {report.orderedBy}
                                        </p>
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>Test Date: {report.testDate}</span>
                                            </div>
                                            <span>•</span>
                                            <span>Lab: {report.laboratory}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Eye className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                        {report.status === "completed" && (
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {report.summary && (
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-sm font-medium mb-1">Summary:</p>
                                        <p className="text-sm text-muted-foreground">{report.summary}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}