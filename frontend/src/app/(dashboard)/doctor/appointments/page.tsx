"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Calendar, Clock, MapPin, User, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { useAppointments, useAppointmentStats } from "@/lib/api/services/doctor/appointments.service"
import {
    AppointmentStatsSkeleton,
    AppointmentsListSkeleton
} from "@/components/skeletons/doctor/appointments.skeleton"
import TitleHeader from "@/components/title-header"
import { useSearchParams } from "next/navigation"

type FilterType = "today" | "upcoming" | "all"

export default function AppointmentsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [activeFilter, setActiveFilter] = useState<FilterType>("today")
    
    const searchParams = useSearchParams()
    const { data: appointments, isLoading: appointmentsLoading } = useAppointments()
    const { data: stats, isLoading: statsLoading } = useAppointmentStats()

    // Set initial filter from URL params
    useEffect(() => {
        const filterParam = searchParams.get('filter') as FilterType
        if (filterParam && ['today', 'upcoming', 'all'].includes(filterParam)) {
            setActiveFilter(filterParam)
        }
    }, [searchParams])

    // Filter appointments based on active filter
    const filteredAppointments = appointments?.filter(appointment => {
        const matchesSearch = 
            appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.type.toLowerCase().includes(searchTerm.toLowerCase())

        const today = new Date().toISOString().split('T')[0]
        const appointmentDate = appointment.date

        switch (activeFilter) {
            case "today":
                return matchesSearch && appointmentDate === today
            case "upcoming":
                return matchesSearch && appointmentDate > today
            case "all":
                return matchesSearch
            default:
                return matchesSearch
        }
    })

    // Get today's appointment statistics
    const todaysAppointments = appointments?.filter(apt => apt.date === new Date().toISOString().split('T')[0]) || []
    const todaysStats = {
        total: todaysAppointments.length,
        completed: todaysAppointments.filter(apt => apt.status === "completed").length,
        pending: todaysAppointments.filter(apt => apt.status === "scheduled" || apt.status === "confirmed").length,
        cancelled: todaysAppointments.filter(apt => apt.status === "cancelled").length
    }

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

    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="Appointments"
                description="Manage and track your appointments"
            />

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <Button
                    variant={activeFilter === "today" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveFilter("today")}
                    className="rounded-md"
                >
                    Today
                </Button>
                <Button
                    variant={activeFilter === "upcoming" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveFilter("upcoming")}
                    className="rounded-md"
                >
                    Upcoming
                </Button>
                <Button
                    variant={activeFilter === "all" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveFilter("all")}
                    className="rounded-md"
                >
                    All Appointments
                </Button>
            </div>

            {/* Search and Add Appointment */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                </Button>
            </div>

            {/* Stats Cards - Show different stats based on active filter */}
            {statsLoading ? (
                <AppointmentStatsSkeleton />
            ) : (
                <div className="grid gap-4 md:grid-cols-4">
                    {activeFilter === "today" ? (
                        <>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Today's Total</p>
                                    <p className="text-2xl font-bold">{todaysStats.total}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold text-green-500">{todaysStats.completed}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-blue-500">{todaysStats.pending}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-500">{todaysStats.cancelled}</p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Total Appointments</p>
                                    <p className="text-2xl font-bold">{stats?.total}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Upcoming</p>
                                    <p className="text-2xl font-bold text-blue-500">{stats?.upcoming}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold text-green-500">{stats?.completed}</p>
                                </CardContent>
                            </Card>
                            <Card className="shadow-sm">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                    <p className="text-2xl font-bold text-red-500">{stats?.cancelled}</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            )}

            {/* Appointments List */}
            {appointmentsLoading ? (
                <AppointmentsListSkeleton />
            ) : (
                <div className="space-y-4">
                    {filteredAppointments && filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appointment) => (
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
                                                {getStatusIcon(appointment.status)}
                                                <span className="ml-1">{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</span>
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
                        ))
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="p-12 text-center">
                                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {activeFilter === "today" 
                                        ? "No appointments scheduled for today"
                                        : `No ${activeFilter} appointments found`
                                    }
                                </p>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule New Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}