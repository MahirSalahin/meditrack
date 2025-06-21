"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  Plus,
  Search,
} from "lucide-react"
import { useMyAppointments } from "@/lib/api/appointment.service"
import { AppointmentCardSkeleton } from "@/components/skeletons/patient/appointment.skeleton"
import TitleHeader from "@/components/title-header"
import { AppointmentDialog } from "@/components/appointment-dialogue"
import AppointmentCard from "@/components/patient/appointments/appointment-card"
import AppointmentStats from "@/components/patient/appointments/appointment-stats"
import { AppointmentStatus } from "@/types/appointment"

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("upcoming")
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false)

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useMyAppointments(50, 0)

  const filteredAppointments = appointmentsData?.appointments?.filter((appointment) => {
    const matchesSearch =
      (appointment.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (appointment.doctor_specialization?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const today = new Date()
    const appointmentDate = new Date(appointment.appointment_date)

    switch (selectedFilter) {
      case "upcoming":
        return matchesSearch && appointmentDate >= today && appointment.status !== AppointmentStatus.COMPLETED
      case "past":
        return matchesSearch && (appointmentDate < today || appointment.status === AppointmentStatus.COMPLETED)
      case "pending":
        return matchesSearch && appointment.status === AppointmentStatus.SCHEDULED
      default:
        return matchesSearch
    }
  }) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="My Appointments"
          description="Schedule and manage your medical appointments"
        />

        <Button onClick={() => setIsAppointmentDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <AppointmentStats />

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
            {filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        )
      }

      {/* No appointments found */}
      {filteredAppointments.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Schedule your first appointment to get started"}
            </p>
            <Button onClick={() => setIsAppointmentDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      )}

      <AppointmentDialog
        isOpen={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      />
    </div>
  )
}