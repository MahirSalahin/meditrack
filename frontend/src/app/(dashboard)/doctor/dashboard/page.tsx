"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, TrendingUp, Stethoscope, ArrowUpRight } from "lucide-react"

export default function DoctorDashboard() {
  const todayAppointments = [
    { id: 1, patient: "John Doe", time: "9:00 AM", type: "Follow-up", status: "confirmed" },
    { id: 2, patient: "Sarah Wilson", time: "10:30 AM", type: "Consultation", status: "pending" },
    { id: 3, patient: "Mike Johnson", time: "2:00 PM", type: "Check-up", status: "confirmed" },
  ]

  const recentPatients = [
    { id: 1, name: "Emily Davis", lastVisit: "2024-01-10", condition: "Hypertension", status: "stable" },
    { id: 2, name: "Robert Brown", lastVisit: "2024-01-08", condition: "Diabetes", status: "monitoring" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`bg-primary text-primary-foreground rounded-2xl p-8 relative overflow-hidden`}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Good morning 👋</h1>
          <h2 className="text-2xl font-semibold mb-4">Dr. Smith</h2>
          <p className="text-lg mb-6 max-w-md">
            You have 8 appointments scheduled for today. Ready to help your patients!
          </p>
          <Button variant="outline" className="bg-secondary text-secondary-foreground">View Schedule</Button>
        </div>
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
            <Stethoscope className="w-16 h-16 text-white/80" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Today&apos;s Appointments</h3>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">8</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-blue-500">3 pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total Patients</h3>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">247</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+12 this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Reviews</h3>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold">15</div>
              <div className="flex items-center text-sm">
                <span className="text-purple-500">Lab results</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Appointments */}
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Today&apos;s Schedule</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg bg-primary text-primary-foreground`}>
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">{appointment.type}</p>
                    <p className="text-sm text-muted-foreground">{appointment.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={appointment.status === "confirmed" ? "default" : "secondary"}
                    className={appointment.status === "confirmed" ? "bg-green-100 text-green-800" : ""}
                  >
                    {appointment.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card className="shadow-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Patients requiring follow-up</CardDescription>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-pink-500 text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    <p className="text-sm text-muted-foreground">Last visit: {patient.lastVisit}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className={
                      patient.status === "stable" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {patient.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
