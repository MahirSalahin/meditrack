"use client"

import { useState, use } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  User, 
  Heart, 
  Pill, 
  Calendar, 
  FileText, 
  TestTube, 
  Phone, 
  Mail,
  MapPin,
  AlertTriangle,
  Activity,
  Clock,
  Stethoscope,
  Eye,
  Download
} from "lucide-react"
import { usePatientHistory } from "@/lib/api/services/doctor/patient-history.service"
import { useRouter } from "next/navigation"
import Link from "next/link"
import TitleHeader from "@/components/title-header"

interface PatientHistoryPageProps {
  params: {
    id: string
  }
}

export default function PatientHistoryPage({ params }: PatientHistoryPageProps) {
  const unwrappedParams = use(params)
  const router = useRouter()
  const { data: patientData, isLoading } = usePatientHistory(unwrappedParams.id)
  const [activeTab, setActiveTab] = useState("overview")

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Patient not found</h2>
        <p className="text-muted-foreground mb-4">The requested patient could not be found.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-500/10 text-green-500"
      case "monitoring":
        return "bg-yellow-500/10 text-yellow-500"
      case "critical":
        return "bg-red-500/10 text-red-500"
      case "active":
        return "bg-blue-500/10 text-blue-500"
      case "completed":
        return "bg-gray-500/10 text-gray-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500"
      case "medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "urgent":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <TitleHeader
          title={`${patientData.basicInfo.name}`}
          description="Complete patient medical history and records"
        />
      </div>

      {/* Patient Basic Info Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold">
                  {patientData.basicInfo.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{patientData.basicInfo.name}</h2>
                <p className="text-muted-foreground">
                  {patientData.basicInfo.age} years • {patientData.basicInfo.gender}
                </p>
                <p className="text-sm text-muted-foreground">
                  Patient ID: {patientData.basicInfo.patientId}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(patientData.basicInfo.status)}>
                {patientData.basicInfo.status.charAt(0).toUpperCase() + patientData.basicInfo.status.slice(1)}
              </Badge>
              <Button size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Blood Type</p>
              <p className="font-medium">{patientData.basicInfo.bloodType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{patientData.basicInfo.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Visit</p>
              <p className="font-medium">{patientData.basicInfo.lastVisit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="font-medium">{patientData.basicInfo.totalVisits}</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 mt-4 pt-4 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="h-4 w-4 mr-2" />
              {patientData.basicInfo.contact.phone}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              {patientData.basicInfo.contact.email}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              {patientData.basicInfo.address}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Major Conditions */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Major Conditions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientData.conditions.map((condition) => (
                  <div key={condition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{condition.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Diagnosed: {condition.diagnosedDate}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Severity: {condition.severity}
                      </p>
                    </div>
                    <Badge className={getStatusColor(condition.status)}>
                      {condition.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Allergies & Alerts */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span>Allergies & Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientData.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <p className="font-medium">{allergy.allergen}</p>
                      <p className="text-sm text-muted-foreground">
                        Reaction: {allergy.reaction} • Severity: {allergy.severity}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Vital Statistics */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span>Latest Vital Signs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {patientData.vitals.map((vital) => (
                  <div key={vital.type} className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{vital.type}</p>
                    <p className="text-lg font-bold">{vital.value}</p>
                    <p className="text-xs text-muted-foreground">{vital.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications Tab */}
        <TabsContent value="medications" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-green-500" />
                <span>Current Medications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patientData.medications.map((medication) => (
                <div key={medication.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{medication.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {medication.dosage} • {medication.frequency}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prescribed by: Dr. {medication.prescribedBy} on {medication.startDate}
                    </p>
                    <p className="text-sm">{medication.instructions}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(medication.status)}>
                      {medication.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Prescription
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span>Medical Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patientData.timeline.map((event, index) => (
                  <div key={event.id} className="flex items-start space-x-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${
                        event.type === 'visit' ? 'bg-blue-100' :
                        event.type === 'test' ? 'bg-green-100' :
                        event.type === 'prescription' ? 'bg-purple-100' :
                        'bg-gray-100'
                      }`}>
                        {event.type === 'visit' ? <Stethoscope className="h-4 w-4 text-blue-600" /> :
                         event.type === 'test' ? <TestTube className="h-4 w-4 text-green-600" /> :
                         event.type === 'prescription' ? <Pill className="h-4 w-4 text-purple-600" /> :
                         <FileText className="h-4 w-4 text-gray-600" />}
                      </div>
                      {index < patientData.timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.date} • Dr. {event.doctor}
                          </p>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {event.priority && (
                            <Badge className={getPriorityColor(event.priority)}>
                              {event.priority}
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              if (event.type === 'prescription') {
                                router.push(`/doctor/prescriptions/${event.relatedId}`)
                              } else if (event.type === 'test') {
                                router.push(`/doctor/test-reports/${event.relatedId}`)
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Test Reports */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-green-500" />
                  <span>Recent Test Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientData.testReports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{report.testName}</p>
                      <p className="text-sm text-muted-foreground">{report.date}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  <span>Medical Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientData.documents.slice(0, 5).map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.type} • {document.date}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}