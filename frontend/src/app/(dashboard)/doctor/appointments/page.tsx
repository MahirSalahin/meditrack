"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useMyAppointments } from "@/lib/api/appointment.service"
import { AppointmentStatus, AppointmentType } from "@/types/appointment"
import { AppointmentsListSkeleton } from "@/components/skeletons/doctor/appointments.skeleton"
import TitleHeader from "@/components/title-header"
import { DoctorAppointmentStats, DoctorAppointmentCard } from "@/components/doctor/appointments"

export default function DoctorAppointmentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all")
    const [typeFilter, setTypeFilter] = useState<AppointmentType | "all">("all")

    const { data: appointmentsData, isLoading: appointmentsLoading } = useMyAppointments(50, 0)

    const appointments = appointmentsData?.appointments || []

    // Filter appointments
    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = appointment.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || appointment.status === statusFilter
        const matchesType = typeFilter === "all" || appointment.appointment_type === typeFilter

        return matchesSearch && matchesStatus && matchesType
    })

    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="My Appointments"
                description="Manage your patient appointments and schedules"
            />

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search by patient name or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as AppointmentStatus | "all")}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
                            <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
                            <SelectItem value={AppointmentStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                            <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
                            <SelectItem value={AppointmentStatus.NO_SHOW}>No Show</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AppointmentType | "all")}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value={AppointmentType.CONSULTATION}>Consultation</SelectItem>
                            <SelectItem value={AppointmentType.FOLLOW_UP}>Follow-up</SelectItem>
                            <SelectItem value={AppointmentType.CHECKUP}>Checkup</SelectItem>
                            <SelectItem value={AppointmentType.EMERGENCY}>Emergency</SelectItem>
                            <SelectItem value={AppointmentType.VIRTUAL}>Virtual</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <DoctorAppointmentStats />

            {/* Appointments List */}
            {appointmentsLoading ? (
                <AppointmentsListSkeleton />
            ) : (
                <div className="space-y-4">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                            <p className="text-muted-foreground">
                                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
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
