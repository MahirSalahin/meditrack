"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Plus,
  Search,
  Clock,
  MapPin,
  User,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react"
import { useAppointments } from "@/lib/api/services/patient/appointment.service"
import { AppointmentStatusCardSkeleton, AppointmentCardSkeleton } from "@/components/skeletons/patient/appointment.skeleton"
import TitleHeader from "@/components/title-header"

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("upcoming")

  const { data: appointments, isLoading: isLoadingAppointments } = useAppointments()

  const filteredAppointments = appointments?.filter((appointment) => {
    const matchesSearch =
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())

    const today = new Date()
    const appointmentDate = new Date(appointment.date)

    switch (selectedFilter) {
      case "upcoming":
        return matchesSearch && appointmentDate >= today && appointment.status !== "completed"
      case "past":
        return matchesSearch && (appointmentDate < today || appointment.status === "completed")
      case "pending":
        return matchesSearch && appointment.status === "pending"
      default:
        return matchesSearch
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="My Appointments"
          description="Schedule and manage your medical appointments"
        />
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      {
        isLoadingAppointments
          ? (
            <div className="grid gap-4 md:grid-cols-4">
              <AppointmentStatusCardSkeleton />
              <AppointmentStatusCardSkeleton />
              <AppointmentStatusCardSkeleton />
              <AppointmentStatusCardSkeleton />
            </div>
          )
          : <div className="grid gap-4 md:grid-cols-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold">
                      {appointments?.filter((a) => a.status === "confirmed" || a.status === "pending").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      {appointments?.filter((a) => a.status === "pending").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">6</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Virtual</p>
                    <p className="text-2xl font-bold">
                      {appointments?.filter((a) => a.appointmentType === "virtual").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
      }

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["upcoming", "past", "pending", "all"].map((filter) => (
            <Button
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {
        isLoadingAppointments ? (
          <div className="space-y-4">
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments?.map((appointment) => (
              <Card key={appointment.id} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${appointment.appointmentType === "virtual" ? "bg-purple-500" : "bg-primary"
                          } text-white`}
                      >
                        {appointment.appointmentType === "virtual" ? (
                          <Video className="h-6 w-6" />
                        ) : (
                          <Calendar className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{appointment.doctor}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {appointment.specialty} • {appointment.type}
                        </p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Reschedule
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Date & Time</p>
                      <p className="text-sm font-semibold">{appointment.date}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.time} ({appointment.duration})
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Location</p>
                      <p className="text-sm font-semibold">{appointment.location}</p>
                      <p className="text-sm text-muted-foreground">{appointment.address}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Contact</p>
                      <p className="text-sm font-semibold">{appointment.phone}</p>
                      <p className="text-sm text-muted-foreground">{appointment.appointmentType}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Insurance</p>
                      <p className="text-sm font-semibold">{appointment.copay}</p>
                      <p className="text-sm text-muted-foreground">{appointment.insurance}</p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 dark:border-yellow-600 dark:bg-yellow-900 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Important Notes:</p>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">{appointment.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>{appointment.doctor}</span>
                      </div>
                    </div>
                    {appointment.status === "confirmed" && (
                      <div className="flex space-x-2">
                        {appointment.appointmentType === "virtual" ? (
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Video className="h-4 w-4 mr-2" />
                            Join Video Call
                          </Button>
                        ) : (
                          <Button size="sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }

      {/* No appointments found */}
      {filteredAppointments?.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Schedule your first appointment to get started"}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
