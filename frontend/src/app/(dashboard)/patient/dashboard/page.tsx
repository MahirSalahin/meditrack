"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Pill, FileText, Activity, Plus, Clock, ArrowRight, Eye } from "lucide-react"
import { usePatientAppointments, usePatientMedications } from "@/lib/api/services/patient/dashboard.service"
import { usePatientPrescriptions } from "@/lib/api/services/patient/prescriptions.service"
import { useTestReports } from "@/lib/api/services/patient/reports.service"
import Link from "next/link"

export default function PatientDashboard() {
  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments()
  const { data: medications, isLoading: medicationsLoading } = usePatientMedications()
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePatientPrescriptions()
  const { data: reports, isLoading: reportsLoading } = useTestReports()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`bg-primary rounded-2xl p-8 text-white relative overflow-hidden`}>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>
          <p className="text-primary-foreground/80">
            Here's an overview of your health information and upcoming activities.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
        <div className="absolute bottom-0 right-8 w-20 h-20 bg-white/5 rounded-full translate-y-4"></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Medications */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Current Medications</CardTitle>
            </div>
            <Link href="/patient/medications">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {medicationsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : medications && medications.length > 0 ? (
              <>
                {medications.slice(0, 3).map((med) => (
                  <div key={med.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{med.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {med.dosage} • {med.frequency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Next: {med.nextDose}
                      </p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(med.status)}>
                      {med.status}
                    </Badge>
                  </div>
                ))}
                {medications.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{medications.length - 3} more medications
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Pill className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No current medications</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            </div>
            <Link href="/patient/appointments">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {appointmentsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : appointments && appointments.length > 0 ? (
              <>
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{appointment.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{appointment.type}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{appointment.date} at {appointment.time}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                {appointments.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{appointments.length - 3} more appointments
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                <Link href="/patient/appointments">
                  <Button variant="outline" size="sm" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recent Prescriptions</CardTitle>
            </div>
            <Link href="/patient/prescriptions">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescriptionsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : prescriptions && prescriptions.length > 0 ? (
              <>
                {prescriptions.slice(0, 3).map((prescription) => (
                  <div key={prescription.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{prescription.medication}</p>
                      <p className="text-xs text-muted-foreground">
                        Dr. {prescription.doctorName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prescribed: {prescription.prescribedDate}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="outline" className={getStatusColor(prescription.status)}>
                        {prescription.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                {prescriptions.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{prescriptions.length - 3} more prescriptions
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No prescriptions found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Test Reports */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Recent Test Reports</CardTitle>
            </div>
            <Link href="/patient/testreports">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : reports && reports.length > 0 ? (
              <>
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{report.testName}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.laboratory}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Test Date: {report.testDate}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      {report.status === "completed" && (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {reports.length > 3 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{reports.length - 3} more reports
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No test reports available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}