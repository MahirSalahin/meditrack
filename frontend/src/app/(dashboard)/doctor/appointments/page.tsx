"use client"

import { useState } from "react"
import { useMyAppointments } from "@/lib/api/appointment.service"
import { AppointmentStatus, AppointmentType, AppointmentWithDetails } from "@/types/appointment"
import { AppointmentsListSkeleton } from "@/components/skeletons/doctor/appointments.skeleton"
import TitleHeader from "@/components/title-header"
import { DoctorAppointmentStats, DoctorAppointmentCard } from "@/components/doctor/appointments"
import { AdvancedAppointmentSearch } from "@/components/advanced-appointment-search"
import { BulkAppointmentActions } from "@/components/bulk-appointment-actions"

export default function DoctorAppointmentsPage() {
    const [selectedAppointments, setSelectedAppointments] = useState<string[]>([])
    const [searchFilters, setSearchFilters] = useState({
        searchTerm: "",
        status: "all" as AppointmentStatus | "all",
        appointmentType: "all" as AppointmentType | "all",
        dateFrom: null as Date | null,
        dateTo: null as Date | null,
        doctorName: "",
        specialization: "",
    })

    const { data: appointmentsData, isLoading: appointmentsLoading } = useMyAppointments(50, 0)

    const appointments = appointmentsData?.appointments || []

    // Filter appointments based on search criteria
    const filteredAppointments = appointments.filter((appointment: AppointmentWithDetails) => {
        const matchesSearch =
            appointment.patient_name?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
            appointment.reason?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
            appointment.doctor_specialization?.toLowerCase().includes(searchFilters.searchTerm.toLowerCase())

        const matchesStatus = searchFilters.status === "all" || appointment.status === searchFilters.status
        const matchesType = searchFilters.appointmentType === "all" || appointment.appointment_type === searchFilters.appointmentType

        const matchesDateFrom = !searchFilters.dateFrom || new Date(appointment.appointment_date) >= searchFilters.dateFrom
        const matchesDateTo = !searchFilters.dateTo || new Date(appointment.appointment_date) <= searchFilters.dateTo

        const matchesDoctorName = !searchFilters.doctorName ||
            appointment.doctor_name?.toLowerCase().includes(searchFilters.doctorName.toLowerCase())

        const matchesSpecialization = !searchFilters.specialization ||
            appointment.doctor_specialization?.toLowerCase().includes(searchFilters.specialization.toLowerCase())

        return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo &&
            matchesDoctorName && matchesSpecialization
    })

    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="My Appointments"
                description="Manage your patient appointments and schedules"
            />

            {/* Advanced Search */}
            <AdvancedAppointmentSearch
                onFiltersChange={setSearchFilters}
                showDoctorFields={true}
                showPatientFields={false}
            />

            {/* Stats Cards */}
            <DoctorAppointmentStats />

            {/* Bulk Actions */}
            <BulkAppointmentActions
                appointments={filteredAppointments}
                selectedAppointments={selectedAppointments}
                onSelectionChange={setSelectedAppointments}
            />

            {/* Appointments List */}
            {appointmentsLoading ? (
                <AppointmentsListSkeleton />
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                            <p className="text-muted-foreground">
                                {searchFilters.searchTerm || searchFilters.status !== "all" || searchFilters.appointmentType !== "all" ||
                                    searchFilters.dateFrom || searchFilters.dateTo || searchFilters.doctorName || searchFilters.specialization
                                    ? "Try adjusting your search or filters"
                                    : "You don't have any appointments scheduled yet"}
                            </p>
                        </div>
                    ) : (
                        filteredAppointments.map((appointment) => (
                            <DoctorAppointmentCard key={appointment.id} appointment={appointment} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
