"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Pill, Activity, Plus, Clock, Heart, Thermometer } from "lucide-react"
import {
  useHealthMetrics,
  usePatientAppointments,
  usePatientMedications,
} from "@/lib/api/services/patient/dashboard.service"
import {
  HealthMetricSkeleton,
  AppointmentCardSkeleton,
  MedicationCardSkeleton,
} from "@/components/skeletons/patient/dashboard.skeleton"

export default function PatientDashboard() {
  const { data: healthMetrics, isLoading: healthLoading } = useHealthMetrics()
  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments()
  const { data: medications, isLoading: medicationsLoading } = usePatientMedications()

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Heart":
        return Heart
      case "Activity":
        return Activity
      case "Thermometer":
        return Thermometer
      default:
        return Activity
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`bg-primary rounded-2xl p-8 text-white relative overflow-hidden`}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>
          <h2 className="text-2xl font-semibold mb-4">John Doe</h2>
          <p className="text-white/80 text-lg mb-6 max-w-md">
            If you are going to use a passage of Lorem Ipsum, you need to be sure there isn&#39;t anything.
          </p>
          <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">Go now</Button>
        </div>
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
            <Activity className="w-16 h-16 text-white/80" />
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Today&#39;s Health Metrics</CardTitle>
          <CardDescription>Your latest vital signs and measurements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {healthLoading ? (
              <>
                <HealthMetricSkeleton />
                <HealthMetricSkeleton />
                <HealthMetricSkeleton />
              </>
            ) : (
              healthMetrics?.map((metric) => {
                const IconComponent = getIcon(metric.icon)
                return (
                  <div key={metric.id} className="flex bg-card border items-center space-x-4 p-4 rounded-lg">
                    <div className="p-3 rounded-full">
                      <IconComponent className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{metric.label}</p>
                      <p className="text-2xl font-bold">
                        {metric.value} <span className="text-sm font-normal">{metric.unit}</span>
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {metric.trend}
                      </Badge>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled medical appointments</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Book New
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {appointmentsLoading ? (
              <>
                <AppointmentCardSkeleton />
                <AppointmentCardSkeleton />
              </>
            ) : (
              appointments?.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg bg-primary text-white`}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.doctor}</p>
                      <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.date} at {appointment.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Medications */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Medication Reminders</CardTitle>
              <CardDescription>Your current medications and schedules</CardDescription>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Med
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicationsLoading ? (
              <>
                <MedicationCardSkeleton />
                <MedicationCardSkeleton />
              </>
            ) : (
              medications?.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-pink-500 text-white">
                      <Pill className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medication.dosage} • {medication.frequency}
                      </p>
                      <p className={`text-sm flex items-center text-muted-foreground`}>
                        <Clock className="h-3 w-3 mr-1" />
                        Next: {medication.nextDose}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Take Now
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
