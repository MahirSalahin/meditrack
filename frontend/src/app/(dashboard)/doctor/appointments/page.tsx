"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Calendar, Clock, MapPin, User, AlertCircle } from "lucide-react"
import { useAppointments, useAppointmentStats } from "@/lib/api/services/doctor/appointments.service"
import {
    AppointmentStatsSkeleton,
    AppointmentsListSkeleton
} from "@/components/skeletons/doctor/appointments.skeleton"
import TitleHeader from "@/components/title-header"

export default function AppointmentsPage() {
    const { data: appointments, isLoading: appointmentsLoading } = useAppointments()
    const { data: stats, isLoading: statsLoading } = useAppointmentStats()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "scheduled":
                return "bg-blue-500/10 text-blue-500"
            case "confirmed":
                return "bg-green-500/10 text-green-500"
            case "completed":
                return "bg-gray-500/10 text-gray-500"
            case "cancelled":
                return "bg-red-500/10 text-red-500"
            default:
                return "bg-gray-500/10 text-gray-500"
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-yellow-500/10 text-yellow-500"
            case "emergency":
                return "bg-red-500/10 text-red-500"
            default:
                return "bg-gray-500/10 text-gray-500"
        }
    }

    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="Appointments"
                description="Manage and track your appointments"
            />

            {/* Search and Add Appointment */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search appointments..."
                        className="pl-9"
                    />
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Stats Cards */}
            {statsLoading ? (
                <AppointmentStatsSkeleton />
            ) : (
                <div className="grid gap-4 md:grid-cols-5">
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Appointments</p>
                            <p className="text-2xl font-bold">{stats?.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Today</p>
                            <p className="text-2xl font-bold text-blue-500">{stats?.today}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Upcoming</p>
                            <p className="text-2xl font-bold text-green-500">{stats?.upcoming}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-gray-500">{stats?.completed}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Cancelled</p>
                            <p className="text-2xl font-bold text-red-500">{stats?.cancelled}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Appointments List */}
            {appointmentsLoading ? (
                <AppointmentsListSkeleton />
            ) : (
                <div className="space-y-4">
                    {appointments?.map((appointment) => (
                        <Card key={appointment.id} className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-semibold">
                                                {appointment.patientName.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{appointment.patientName}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {appointment.patientAge} years • {appointment.patientGender}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Badge className={getStatusColor(appointment.status)}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </Badge>
                                        {appointment.priority !== "normal" && (
                                            <Badge className={getPriorityColor(appointment.priority)}>
                                                {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date & Time</p>
                                        <p className="font-medium">{appointment.date} at {appointment.time}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Duration</p>
                                        <p className="font-medium">{appointment.duration}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Type</p>
                                        <p className="font-medium capitalize">{appointment.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{appointment.location}</p>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-lg p-4 mb-4">
                                    <div className="flex items-start space-x-2">
                                        <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium mb-1">{appointment.reason}</p>
                                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <User className="h-4 w-4 mr-1" />
                                            {appointment.previousVisits} previous visits
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            Last visit: {appointment.lastVisitDate}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {appointment.appointmentType}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Reschedule
                                        </Button>
                                        <Button size="sm">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
