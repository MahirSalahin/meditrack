import { AppointmentWithDetails, AppointmentStatus, AppointmentType } from '@/types/appointment'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, AlertCircle, Stethoscope, CheckCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { getStatusIcon } from '@/components/ui-lib'
import { useUpdateAppointment, useDeleteAppointment } from '@/lib/api/appointment.service'
import { AppointmentReminders } from '@/components/appointment-reminders'
import { CancelConfirmationDialog } from '@/components/confirmation-dialog'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DoctorAppointmentCardProps {
    appointment: AppointmentWithDetails
}

export default function DoctorAppointmentCard({ appointment }: DoctorAppointmentCardProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const updateAppointment = useUpdateAppointment()
    const deleteAppointment = useDeleteAppointment()
    const router = useRouter()

    const handlePatientClick = () => {
        if (appointment.patient_id) {
            router.push(`/doctor/patients/${appointment.patient_id}`)
        }
    }

    const getStatusVariant = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.CONFIRMED:
                return "confirmed"
            case AppointmentStatus.SCHEDULED:
                return "scheduled"
            case AppointmentStatus.CANCELLED:
                return "cancelled"
            case AppointmentStatus.COMPLETED:
                return "completed"
            case AppointmentStatus.IN_PROGRESS:
                return "in_progress"
            case AppointmentStatus.NO_SHOW:
                return "no_show"
            default:
                return "default"
        }
    }

    const formatAppointmentDate = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'MMM dd, yyyy')
    }

    const formatAppointmentTime = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'h:mm a')
    }

    const getAppointmentTypeLabel = (type: AppointmentType) => {
        switch (type) {
            case AppointmentType.CONSULTATION:
                return "Consultation"
            case AppointmentType.FOLLOW_UP:
                return "Follow-up"
            case AppointmentType.CHECKUP:
                return "Check-up"
            case AppointmentType.EMERGENCY:
                return "Emergency"
            case AppointmentType.VIRTUAL:
                return "Virtual"
            default:
                return type
        }
    }

    const getStatusLabel = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.SCHEDULED:
                return "Scheduled"
            case AppointmentStatus.CONFIRMED:
                return "Confirmed"
            case AppointmentStatus.IN_PROGRESS:
                return "In Progress"
            case AppointmentStatus.COMPLETED:
                return "Completed"
            case AppointmentStatus.CANCELLED:
                return "Cancelled"
            case AppointmentStatus.NO_SHOW:
                return "No Show"
            default:
                return status
        }
    }

    const handleStatusUpdate = (newStatus: AppointmentStatus) => {
        updateAppointment.mutate({
            appointmentId: appointment.id,
            data: { status: newStatus }
        })
    }

    const handleCancelAppointment = () => {
        deleteAppointment.mutate(appointment.id)
        setShowCancelDialog(false)
    }

    const getPatientInitials = (name?: string) => {
        if (!name) return "P"
        return name.split(" ").map(n => n[0]).join("").toUpperCase()
    }

    return (
        <>
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    {/* Header with Patient Info and Status */}
                    <div className="flex items-start justify-between mb-4">
                        <div 
                            className="flex items-start space-x-4 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors flex-1"
                            onClick={handlePatientClick}
                        >
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-lg font-semibold text-primary">
                                    {getPatientInitials(appointment.patient_name)}
                                </span>
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                                        {appointment.patient_name || "Patient Name Not Available"}
                                    </h3>
                                    <Badge variant={getStatusVariant(appointment.status)}>
                                        {getStatusIcon(appointment.status)}
                                        <span className="ml-1">{getStatusLabel(appointment.status)}</span>
                                    </Badge>
                                    {appointment.appointment_type === AppointmentType.EMERGENCY && (
                                        <Badge variant="destructive">
                                            <AlertCircle className="h-3 w-3 mr-1" />
                                            Emergency
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Patient ID: {appointment.patient_id} • {getAppointmentTypeLabel(appointment.appointment_type)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {appointment.reason || 'No reason provided'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Date & Time</p>
                            <p className="text-sm font-semibold">{formatAppointmentDate(appointment.appointment_date)}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatAppointmentTime(appointment.appointment_date)}
                                {appointment.duration_minutes && ` (${appointment.duration_minutes} min)`}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Type</p>
                            <p className="text-sm font-semibold">{getAppointmentTypeLabel(appointment.appointment_type)}</p>
                            <p className="text-sm text-muted-foreground">
                                {appointment.appointment_type === AppointmentType.VIRTUAL ? 'Virtual' : 'In-Person'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Payment</p>
                            <p className="text-sm font-semibold">
                                {appointment.consultation_fee ? `$${appointment.consultation_fee}` : 'TBD'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {appointment.payment_status || 'Pending'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase">Created</p>
                            <p className="text-sm font-semibold">{formatAppointmentDate(appointment.created_at)}</p>
                            <p className="text-sm text-muted-foreground">
                                {formatAppointmentTime(appointment.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Medical Indicators */}
                    {(appointment.follow_up_required || appointment.prescription_given || appointment.notes) && (
                        <div className="bg-muted rounded-lg p-4 mb-4">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div className="space-y-2">
                                    {appointment.follow_up_required && (
                                        <div className="flex items-center text-orange-600">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Follow-up Required</span>
                                        </div>
                                    )}
                                    {appointment.prescription_given && (
                                        <div className="flex items-center text-green-600">
                                            <Stethoscope className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Prescription Given</span>
                                        </div>
                                    )}
                                    {appointment.notes && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Notes:</p>
                                            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatAppointmentTime(appointment.appointment_date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{appointment.patient_name || 'Unknown Patient'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{getAppointmentTypeLabel(appointment.appointment_type)}</span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {/* Reminders Component */}
                            <AppointmentReminders
                                appointmentId={appointment.id}
                                appointmentDate={appointment.appointment_date}
                                variant="badge"
                            />

                            {/* Status Update Buttons */}
                            {appointment.status === AppointmentStatus.SCHEDULED && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(AppointmentStatus.CONFIRMED)}
                                    disabled={updateAppointment.isPending}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Confirm
                                </Button>
                            )}
                            {appointment.status === AppointmentStatus.CONFIRMED && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusUpdate(AppointmentStatus.IN_PROGRESS)}
                                    disabled={updateAppointment.isPending}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Start
                                </Button>
                            )}
                            {appointment.status === AppointmentStatus.IN_PROGRESS && (
                                <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(AppointmentStatus.COMPLETED)}
                                    disabled={updateAppointment.isPending}
                                >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete
                                </Button>
                            )}
                            {/* Show Cancel button only if not cancelled */}
                            {appointment.status !== AppointmentStatus.CANCELLED && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowCancelDialog(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cancel Confirmation Dialog */}
            <CancelConfirmationDialog
                isOpen={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                onConfirm={handleCancelAppointment}
                itemName="appointment"
                description={`Are you sure you want to cancel this appointment with ${appointment.patient_name}? This action cannot be undone.`}
                isLoading={deleteAppointment.isPending}
                loadingText="Cancelling appointment..."
            />
        </>
    )
} 