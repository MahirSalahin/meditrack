"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Clock, ArrowRight, Stethoscope, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useDoctorDashboard } from "@/lib/api/services/doctor/dashboard.service"
import Link from "next/link"
import TitleHeader from "@/components/title-header"

export default function DoctorDashboard() {
  const { data: dashboardData, isLoading } = useDoctorDashboard()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Good morning, Doctor 👋</h1>
          <p className="text-primary-foreground/80">
            You have {dashboardData?.todaysAppointments?.length || 0} appointments scheduled for today
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full translate-y-4"></div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Patients */}
        <Link href="/doctor/patients">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{dashboardData?.stats?.totalPatients || 0}</p>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-xs text-green-600">+{dashboardData?.stats?.newPatientsThisMonth || 0} this month</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Total Appointments */}
        <Link href="/doctor/appointments">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{dashboardData?.stats?.totalAppointments || 0}</p>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-xs text-blue-600">This month</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Today's Appointments */}
        <Link href="/doctor/appointments?filter=today">
          <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{dashboardData?.todaysAppointments?.length || 0}</p>
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                <p className="text-xs text-purple-600">View schedule</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Schedule */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Today's Schedule</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <Link href="/doctor/appointments?filter=today">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardData?.todaysAppointments && dashboardData.todaysAppointments.length > 0 ? (
            <>
              {dashboardData.todaysAppointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                        <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                        <Link href={`/doctor/patients/${appointment.patientId}`}>
                            <p className="font-medium hover:text-primary cursor-pointer">
                                {appointment.patientName}
                            </p>
                        </Link>
                        <p className="text-sm text-muted-foreground">{appointment.type}</p>
                        <p className="text-sm text-muted-foreground">
                            {appointment.time} • {appointment.duration}
                        </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
              
              {dashboardData.todaysAppointments.length > 5 && (
                <div className="text-center pt-2">
                  <Link href="/doctor/appointments?filter=today">
                    <Button variant="ghost" size="sm">
                      View {dashboardData.todaysAppointments.length - 5} more appointments
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}