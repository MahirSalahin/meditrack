"use client"

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    ArrowLeft,
    Bookmark,
    BookmarkIcon,
    User,
    Phone,
    Mail,
    Calendar,
    Heart,
    FileText,
    Pill,
    AlertTriangle,
    Clock,
} from "lucide-react"
import {
    usePatientById,
    useToggleBookmark,
} from "@/lib/api/services/doctor/patients.service"
import { PatientDetailSkeleton } from "@/components/skeletons/doctor/patients.skeleton"
import AddPrescriptionDialog from "@/components/doctor/prescriptions/add-prescription-dialog"
import PatientPrescriptions from "@/components/doctor/prescriptions/patient-prescriptions"
import { useQuery } from "@tanstack/react-query"
import { MedicationItem } from "@/types/medication"
import axiosInstance from "@/lib/axios-interceptor"
import { usePatientRecords } from "@/lib/api/services/patient/record.service"
import { useState } from "react"

function usePatientMedicationsList(patientId: string) {
    return useQuery({
        queryKey: ["patient-medications-list", patientId],
        queryFn: async () => {
            const res = await axiosInstance(`/medications/patient/${patientId}/list-items`)
            if (!res.data) throw new Error("Failed to fetch patient medications")
            return res.data as Promise<{ medications: MedicationItem[] }>
        },
        enabled: !!patientId,
    })
}

function DoctorPatientRecordsList({ patientId }: { patientId: string }) {
    const { data: records, isLoading, error } = usePatientRecords(patientId)
    const [loadingAttachmentId, setLoadingAttachmentId] = useState<string | null>(null)

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error loading records</div>
    if (!records || records.length === 0) return (
        <div className="text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            No records found for this patient.
        </div>
    )

    const handleViewAttachment = async (attachmentId: string) => {
        setLoadingAttachmentId(attachmentId)
        try {
            const { data: signedUrl } = await axiosInstance.get<string>(`/records/attachment/${attachmentId}/view`)
            window.open(signedUrl, "_blank")
        } catch {
            alert("Failed to open attachment PDF.")
        } finally {
            setLoadingAttachmentId(null)
        }
    }

    return (
        <div className="space-y-4">
            {records.map(record => {
                const hasAttachment = record.attachments && record.attachments.length > 0
                const firstAttachment = hasAttachment ? record.attachments[0] : null
                return (
                    <div key={record.id} className="p-4 border rounded bg-card text-card-foreground">
                        <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <span
                                className={`font-semibold ${hasAttachment ? "text-primary hover:underline cursor-pointer" : "text-muted-foreground"}`}
                                onClick={() => hasAttachment && firstAttachment && handleViewAttachment(firstAttachment.id)}
                                style={{ pointerEvents: hasAttachment ? "auto" : "none" }}
                            >
                                {record.title}
                                {loadingAttachmentId === (firstAttachment?.id ?? "") && (
                                    <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
                                )}
                            </span>
                            <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground capitalize">
                                {record.category}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {record.record_date ? new Date(record.record_date).toLocaleDateString() : "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{record.summary}</div>
                    </div>
                )
            })}
        </div>
    )
}

export default function PatientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const patientId = params.id as string

    const { data: patient, isLoading, error } = usePatientById(patientId)
    const toggleBookmarkMutation = useToggleBookmark()

    const handleToggleBookmark = () => {
        if (patient) {
            toggleBookmarkMutation.mutate(patient.id)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <PatientDetailSkeleton />
            </div>
        )
    }

    if (error || !patient) {
        return (
            <div className="container mx-auto px-4 space-y-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                </div>
                <Card className="shadow-sm">
                    <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">Patient not found</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Patients
                </Button>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleBookmark}
                        disabled={toggleBookmarkMutation.isPending}
                    >
                        {patient.is_bookmarked ? (
                            <Bookmark className="h-4 w-4 mr-2 fill-current" />
                        ) : (
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                        )}
                        {patient.is_bookmarked ? "Bookmarked" : "Bookmark"}
                    </Button>
                </div>
            </div>

            {/* Patient Overview Card */}
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-6">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-2xl font-semibold">
                                    {patient.name.split(" ").map(n => n[0]).join("")}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">{patient.name}</h2>
                                <div className="flex items-center space-x-4 text-muted-foreground">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        {patient.age} years • {patient.gender}
                                    </div>
                                    <div className="flex items-center">
                                        <Heart className="h-4 w-4 mr-1" />
                                        {patient.blood_group}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-1" />
                                        {patient?.email}
                                    </div>
                                    <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-1" />
                                        {patient?.phone}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* <Badge className={`${getStatusColor(patient.status)} border`} variant="outline">
                            <Activity className="h-3 w-3 mr-1" />
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </Badge> */}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                            <p className="text-sm text-muted-foreground">Last Visit</p>
                            <p className="font-semibold">{patient.gender}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <p className="text-sm text-muted-foreground">Next Appointment</p>
                            <p className="font-semibold">{patient.gender}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <FileText className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                            <p className="text-sm text-muted-foreground">Primary Condition</p>
                            <p className="font-semibold">{patient.gender}</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                            <p className="text-sm text-muted-foreground">Blood Type</p>
                            <p className="font-semibold">{patient.blood_group}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="prescriptions" className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="prescriptions">
                        <Pill className="h-4 w-4 mr-2" />
                        Prescriptions
                    </TabsTrigger>
                    <TabsTrigger value="medications">
                        <Pill className="h-4 w-4 mr-2" />
                        Medications
                    </TabsTrigger>
                    <TabsTrigger value="allergies">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Allergies
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <FileText className="h-4 w-4 mr-2" />
                        Medical History
                    </TabsTrigger>
                    <TabsTrigger value="appointments">
                        <Calendar className="h-4 w-4 mr-2" />
                        Appointments
                    </TabsTrigger>
                    <TabsTrigger value="records">
                        <FileText className="h-4 w-4 mr-2" />
                        Records
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="prescriptions">
                    <PatientPrescriptions patient={patient} />
                </TabsContent>

                <TabsContent value="medications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Pill className="h-5 w-5 mr-2" />
                                Current Medications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PatientMedicationsList patientId={patientId} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="allergies">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                Known Allergies
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* {patient.allergies.map((allergy, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50/50">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-red-700">{allergy}</h4>
                                                <p className="text-sm text-red-600">Severe allergy - avoid exposure</p>
                                            </div>
                                        </div>
                                        <Badge variant="destructive">Critical</Badge>
                                    </div>
                                ))} */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Medical History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-semibold">Primary Diagnosis</h4>
                                    <p className="text-muted-foreground">{patient.gender}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Current status: {patient.gender}
                                    </p>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-semibold">Recent Visits</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                                <p className="font-medium">Regular Checkup</p>
                                                <p className="text-sm text-muted-foreground">{patient.gender}</p>
                                            </div>
                                            <Badge variant="outline">Completed</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-3 border rounded">
                                            <div>
                                                <p className="font-medium">Follow-up Appointment</p>
                                                <p className="text-sm text-muted-foreground">{patient.gender}</p>
                                            </div>
                                            <Badge variant="secondary">Scheduled</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="appointments">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    Appointments
                                </div>
                                <Button size="sm">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule New
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50 border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Upcoming Appointment</h4>
                                            <p className="text-sm text-muted-foreground">{patient.gender} at 10:00 AM</p>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-500/10 text-green-500">Scheduled</Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-lg bg-gray-500/10 flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Last Visit</h4>
                                            <p className="text-sm text-muted-foreground">{patient.gender} at 2:30 PM</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">Completed</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="records">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Medical Records
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DoctorPatientRecordsList patientId={patientId} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-auto flex-col py-4">
                            <Calendar className="h-6 w-6 mb-2" />
                            Schedule Appointment
                        </Button>
                        <Button variant="outline" className="h-auto flex-col py-4">
                            <FileText className="h-6 w-6 mb-2" />
                            Add Medical Record
                        </Button>
                        <AddPrescriptionDialog
                            patient={patient}
                            trigger={
                                <Button variant="outline" className="h-auto flex-col py-4">
                                    <Pill className="h-6 w-6 mb-2" />
                                    Prescribe Medication
                                </Button>
                            }
                        />
                        <Button variant="outline" className="h-auto flex-col py-4">
                            <Mail className="h-6 w-6 mb-2" />
                            Send Message
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function getMedicationStatus(startDate?: string, duration?: string): "past" | "current" | "upcoming" | "unknown" {
    if (!startDate || !duration) return "unknown"
    const start = new Date(startDate)
    const daysMatch = duration.match(/(\d+)/)
    if (!daysMatch) return "unknown"
    const days = parseInt(daysMatch[1], 10)
    if (isNaN(days)) return "unknown"
    const end = new Date(start)
    end.setDate(start.getDate() + days - 1)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (today < start) return "upcoming"
    if (today > end) return "past"
    return "current"
}

function statusColor(status: string) {
    switch (status) {
        case "current": return "bg-green-100 text-green-800"
        case "past": return "bg-gray-100 text-gray-600"
        case "upcoming": return "bg-blue-100 text-blue-800"
        default: return "bg-yellow-100 text-yellow-800"
    }
}

function PatientMedicationsList({ patientId }: { patientId: string }) {
    const { data, isLoading, error } = usePatientMedicationsList(patientId)
    const medications = data?.medications || []

    if (error) return <div>Error loading medications</div>
    if (isLoading) return <div>Loading...</div>
    if (!medications.length) return <div>No medications found.</div>

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-2">Medications</h2>
            {medications.map((med: MedicationItem, idx: number) => {
                const status = getMedicationStatus(med.prescribed_date, med.duration)
                return (
                    <Card key={med.id}>
                        <CardContent className="py-3 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">{idx + 1}.</span>
                                <span>{med.medication_name}</span>
                                <Badge>{med.dosage}</Badge>
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${statusColor(status)}`}>{status}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {med.frequency} | Qty: {med.quantity} | Duration: {med.duration} | {med.instructions}
                            </div>
                            {med.doctor && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    Prescribed by: {med.doctor.name} {med.doctor.specialization && `(${med.doctor.specialization})`}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
