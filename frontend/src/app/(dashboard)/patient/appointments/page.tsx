"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Plus,
} from "lucide-react"
import { useMyAppointments } from "@/lib/api/appointment.service"
import { AppointmentCardSkeleton } from "@/components/skeletons/patient/appointment.skeleton"
import TitleHeader from "@/components/title-header"
import { AppointmentDialog } from "@/components/appointment-dialogue"
import AppointmentCard from "@/components/patient/appointments/appointment-card"
import AppointmentStats from "@/components/patient/appointments/appointment-stats"
import { AppointmentStatus, AppointmentType, AppointmentWithDetails } from "@/types/appointment"
import { AdvancedAppointmentSearch } from "@/components/advanced-appointment-search"

interface AdvancedSearchFilters {
  searchTerm: string
  status: AppointmentStatus | "all"
  appointmentType: AppointmentType | "all"
  dateFrom: Date | null
  dateTo: Date | null
  doctorName: string
  specialization: string
}

export default function AppointmentsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false)
  const [searchFilters, setSearchFilters] = useState<AdvancedSearchFilters>({
    searchTerm: "",
    status: "all",
    appointmentType: "all",
    dateFrom: null,
    dateTo: null,
    doctorName: "",
    specialization: "",
  })

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useMyAppointments(50, 0)

  const appointments = appointmentsData?.appointments || []

  // Filter appointments based on search criteria and selected filter
  const filteredAppointments = appointments.filter((appointment: AppointmentWithDetails) => {
    // Search filters
    const matchesSearch =
      appointment.doctor_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      appointment.doctor_specialization?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())

    const matchesStatus = searchFilters.status === "all" || appointment.status === searchFilters.status
    const matchesType = searchFilters.appointmentType === "all" || appointment.appointment_type === searchFilters.appointmentType

    const matchesDateFrom = !searchFilters.dateFrom || new Date(appointment.appointment_date) >= searchFilters.dateFrom
    const matchesDateTo = !searchFilters.dateTo || new Date(appointment.appointment_date) <= searchFilters.dateTo

    const matchesDoctorName = !searchFilters.doctorName ||
      appointment.doctor_name?.toLowerCase().includes(searchFilters.doctorName.toLowerCase())

    const matchesSpecialization = !searchFilters.specialization ||
      appointment.doctor_specialization?.toLowerCase().includes(searchFilters.specialization.toLowerCase())

    // Quick filter logic
    const today = new Date()
    const appointmentDate = new Date(appointment.appointment_date)

    let matchesQuickFilter = true
    switch (selectedFilter) {
      case "upcoming":
        matchesQuickFilter = appointmentDate >= today && appointment.status !== AppointmentStatus.COMPLETED
        break
      case "past":
        matchesQuickFilter = appointmentDate < today || appointment.status === AppointmentStatus.COMPLETED
        break
      case "pending":
        matchesQuickFilter = appointment.status === AppointmentStatus.SCHEDULED
        break
      case "all":
      default:
        matchesQuickFilter = true
        break
    }

    return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo &&
      matchesDoctorName && matchesSpecialization && matchesQuickFilter
  })

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

      {/* Advanced Search */}
      <AdvancedAppointmentSearch
        onFiltersChange={setSearchFilters}
        showDoctorFields={false}
        showPatientFields={true}
      />

      {/* Quick Filter Buttons */}
      <div className="flex gap-2">
        {["all", "past", "pending"].map((filter) => (
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

      {/* Appointments List */}
      {
        isLoadingAppointments ? (
          <div className="space-y-4">
            <AppointmentCardSkeleton />
            <AppointmentCardSkeleton />
          </div>
        ) :
          filteredAppointments?.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <Card className="shadow-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No appointments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchFilters.searchTerm || selectedFilter !== "all" ||
                    searchFilters.status !== "all" || searchFilters.appointmentType !== "all" ||
                    searchFilters.dateFrom || searchFilters.dateTo || searchFilters.doctorName || searchFilters.specialization
                    ? "Try adjusting your search terms or filters"
                    : "Schedule your first appointment to get started"}
                </p>
                <Button onClick={() => setIsAppointmentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          )
      }

      <AppointmentDialog
        isOpen={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
      />
    </div>
  )
}