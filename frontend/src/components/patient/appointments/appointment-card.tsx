import { AppointmentWithDetails, AppointmentStatus, AppointmentType } from '@/types/appointment'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, Video, AlertCircle, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { getStatusIcon } from '@/components/ui-lib'

export default function AppointmentCard({ appointment }: { appointment: AppointmentWithDetails }) {

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

    return (
        <Card key={appointment.id} className="shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                        <div
                            className={`p-3 rounded-lg ${appointment.appointment_type === AppointmentType.VIRTUAL ? "bg-purple-500" : "bg-primary"
                                } text-white`}
                        >
                            {appointment.appointment_type === AppointmentType.VIRTUAL ? (
                                <Video className="h-6 w-6" />
                            ) : (
                                <Calendar className="h-6 w-6" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-semibold">{appointment.doctor_name || 'Unknown'}</h3>
                                <Badge variant={getStatusVariant(appointment.status)}>
                                    {getStatusIcon(appointment.status)}
                                    <span className="ml-1">{getStatusLabel(appointment.status)}</span>
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {appointment.doctor_specialization || 'General Medicine'} • {getAppointmentTypeLabel(appointment.appointment_type)}
                            </p>
                            <p className="text-sm text-muted-foreground">{appointment.reason || 'No reason provided'}</p>
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
                        <p className="text-sm font-semibold">{formatAppointmentDate(appointment.appointment_date)}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatAppointmentTime(appointment.appointment_date)}
                            {appointment.duration_minutes && ` (${appointment.duration_minutes} min)`}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Location</p>
                        <p className="text-sm font-semibold">
                            {appointment.appointment_type === AppointmentType.VIRTUAL ? 'Virtual Appointment' : 'In-Person'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {appointment.appointment_type === AppointmentType.VIRTUAL ? 'Online Meeting' : 'Clinic Location'}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Type</p>
                        <p className="text-sm font-semibold">{getAppointmentTypeLabel(appointment.appointment_type)}</p>
                        <p className="text-sm text-muted-foreground">
                            {appointment.appointment_type === AppointmentType.VIRTUAL ? 'Video Call' : 'Face to Face'}
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
                            <span>{formatAppointmentTime(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{appointment.appointment_type === AppointmentType.VIRTUAL ? 'Virtual' : 'In-Person'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>Dr. {appointment.doctor_name || 'Unknown'}</span>
                        </div>
                    </div>
                    {appointment.status === AppointmentStatus.CONFIRMED && (
                        <div className="flex space-x-2">
                            {appointment.appointment_type === AppointmentType.VIRTUAL ? (
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
    )
}
