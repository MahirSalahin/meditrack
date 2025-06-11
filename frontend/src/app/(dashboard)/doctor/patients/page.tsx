"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Phone, Mail, Calendar, Clock } from "lucide-react"
import { usePatients, usePatientStats } from "@/lib/api/services/doctor/patients.service"
import {
    PatientStatsSkeleton,
    PatientsListSkeleton
} from "@/components/skeletons/doctor/patients.skeleton"
import TitleHeader from "@/components/title-header"
import Link from "next/link"
import { Eye } from "lucide-react"

export default function PatientsPage() {
    const { data: patients, isLoading: patientsLoading } = usePatients()
    const { data: stats, isLoading: statsLoading } = usePatientStats()

    const getStatusColor = (status: string) => {
        switch (status) {
            case "stable":
                return "bg-green-500/10 text-green-500"
            case "monitoring":
                return "bg-yellow-500/10 text-yellow-500"
            case "critical":
                return "bg-red-500/10 text-red-500"
            default:
                return "bg-gray-500/10 text-gray-500"
        }
    }

    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="Patients"
                description="Manage and monitor your patient list"
            />

            {/* Search and Add Patient */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search patients..."
                        className="pl-9"
                    />
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Patient
                </Button>
            </div>

            {/* Stats Cards */}
            {statsLoading ? (
                <PatientStatsSkeleton />
            ) : (
                <div className="grid gap-4 md:grid-cols-5">
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Total Patients</p>
                            <p className="text-2xl font-bold">{stats?.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Stable</p>
                            <p className="text-2xl font-bold text-green-500">{stats?.stable}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Monitoring</p>
                            <p className="text-2xl font-bold text-yellow-500">{stats?.monitoring}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">Critical</p>
                            <p className="text-2xl font-bold text-red-500">{stats?.critical}</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">New This Month</p>
                            <p className="text-2xl font-bold text-blue-500">{stats?.newThisMonth}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Patients List */}
            {patientsLoading ? (
                <PatientsListSkeleton />
            ) : (
                <div className="space-y-4">
                    {patients?.map((patient) => (
                        <Card key={patient.id} className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-semibold">
                                                {patient.name.split(" ").map(n => n[0]).join("")}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">{patient.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {patient.age} years • {patient.gender}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={getStatusColor(patient.status)}>
                                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Condition</p>
                                        <p className="font-medium">{patient.condition}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Blood Type</p>
                                        <p className="font-medium">{patient.bloodType}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Visit</p>
                                        <p className="font-medium">{patient.lastVisit}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Next Appointment</p>
                                        <p className="font-medium">{patient.nextAppointment}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {patient.medications.map((medication, index) => (
                                        <Badge key={index} variant="secondary">
                                            {medication}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {patient.contact.email}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {patient.contact.phone}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule
                                        </Button>
                                        <Link href={`/doctor/patients/${patient.id}`}>
                                            <Button size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                View History
                                            </Button>
                                        </Link>
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