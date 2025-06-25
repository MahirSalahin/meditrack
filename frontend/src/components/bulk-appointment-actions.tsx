"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    MoreHorizontal,
    CheckCircle,
    Clock,
    X,
    Users,
    AlertTriangle,
    Bell
} from "lucide-react"
import { useBatchUpdateAppointments } from "@/lib/api/appointment.service"
import { AppointmentStatus, AppointmentWithDetails } from "@/types/appointment"
import { AppointmentReminders } from "./appointment-reminders"
import { ConfirmationDialog } from "./confirmation-dialog"

interface BulkAppointmentActionsProps {
    appointments: AppointmentWithDetails[]
    selectedAppointments: string[]
    onSelectionChange: (appointmentIds: string[]) => void
    className?: string
}

export function BulkAppointmentActions({
    appointments,
    selectedAppointments,
    onSelectionChange,
    className
}: BulkAppointmentActionsProps) {
    const [showBulkDialog, setShowBulkDialog] = useState(false)
    const [showBulkConfirmDialog, setShowBulkConfirmDialog] = useState(false)
    const [bulkAction, setBulkAction] = useState<"status" | "notes" | "reminders">("status")
    const [bulkStatus, setBulkStatus] = useState<AppointmentStatus>(AppointmentStatus.CONFIRMED)
    const [bulkNotes, setBulkNotes] = useState("")
    const [showReminderDialog, setShowReminderDialog] = useState(false)
    const [selectedAppointmentForReminder, setSelectedAppointmentForReminder] = useState<string>("")

    const batchUpdate = useBatchUpdateAppointments()

    const selectedAppointmentDetails = appointments.filter(apt =>
        selectedAppointments.includes(apt.id)
    )

    const handleSelectAll = () => {
        if (selectedAppointments.length === appointments.length) {
            onSelectionChange([])
        } else {
            onSelectionChange(appointments.map(apt => apt.id))
        }
    }

    const handleSelectAppointment = (appointmentId: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedAppointments, appointmentId])
        } else {
            onSelectionChange(selectedAppointments.filter(id => id !== appointmentId))
        }
    }

    const handleBulkAction = async () => {
        if (selectedAppointments.length === 0) return

        try {
            const updateData: { status?: AppointmentStatus; notes?: string } = {}

            if (bulkAction === "status") {
                updateData.status = bulkStatus
            } else if (bulkAction === "notes") {
                updateData.notes = bulkNotes
            }

            await batchUpdate.mutateAsync({
                appointment_ids: selectedAppointments,
                ...updateData
            })

            setShowBulkDialog(false)
            setShowBulkConfirmDialog(false)
            setBulkNotes("")
            onSelectionChange([])
        } catch (error) {
            console.error("Error performing bulk action:", error)
        }
    }

    const getStatusIcon = (status: AppointmentStatus) => {
        switch (status) {
            case AppointmentStatus.CONFIRMED:
                return <CheckCircle className="h-4 w-4" />
            case AppointmentStatus.IN_PROGRESS:
                return <Clock className="h-4 w-4" />
            case AppointmentStatus.COMPLETED:
                return <CheckCircle className="h-4 w-4" />
            case AppointmentStatus.CANCELLED:
                return <X className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
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

    const getBulkActionTitle = () => {
        switch (bulkAction) {
            case "status":
                return `Update Status (${selectedAppointments.length} appointments)`
            case "notes":
                return `Add Notes (${selectedAppointments.length} appointments)`
            default:
                return `Bulk Action (${selectedAppointments.length} appointments)`
        }
    }

    const getBulkActionDescription = () => {
        switch (bulkAction) {
            case "status":
                return `Update the status to "${getStatusLabel(bulkStatus)}" for all selected appointments`
            case "notes":
                return "Add the same notes to all selected appointments"
            default:
                return "Perform this action on all selected appointments"
        }
    }

    if (selectedAppointments.length === 0) {
        return (
            <div className={className}>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={appointments.length > 0 && selectedAppointments.length === appointments.length}
                            onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm text-muted-foreground">
                            {selectedAppointments.length} of {appointments.length} selected
                        </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                        Select appointments to perform bulk actions
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className={className}>
            {/* Bulk Actions Toolbar */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            checked={selectedAppointments.length === appointments.length}
                            onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium">
                            {selectedAppointments.length} of {appointments.length} selected
                        </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Bulk Actions
                    </Badge>
                </div>

                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setBulkAction("status")
                            setShowBulkDialog(true)
                        }}
                        disabled={batchUpdate.isPending}
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Update Status
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setBulkAction("notes")
                            setShowBulkDialog(true)
                        }}
                        disabled={batchUpdate.isPending}
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Add Notes
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowReminderDialog(true)}
                        disabled={batchUpdate.isPending}
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Set Reminders
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onSelectionChange([])}>
                                <X className="h-4 w-4 mr-2" />
                                Clear Selection
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Selected Appointments Preview */}
            <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Selected Appointments:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {selectedAppointmentDetails.slice(0, 6).map((appointment) => (
                        <div
                            key={appointment.id}
                            className="flex items-center space-x-2 p-2 border rounded text-xs"
                        >
                            <Checkbox
                                checked={selectedAppointments.includes(appointment.id)}
                                onCheckedChange={(checked) =>
                                    handleSelectAppointment(appointment.id, checked as boolean)
                                }
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                    {appointment.patient_name || "Unknown Patient"}
                                </p>
                                <p className="text-muted-foreground truncate">
                                    {new Date(appointment.appointment_date).toLocaleDateString()}
                                </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {getStatusIcon(appointment.status)}
                                <span className="ml-1">{getStatusLabel(appointment.status)}</span>
                            </Badge>
                        </div>
                    ))}
                    {selectedAppointmentDetails.length > 6 && (
                        <div className="flex items-center justify-center p-2 border rounded text-xs text-muted-foreground">
                            +{selectedAppointmentDetails.length - 6} more
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk Action Dialog */}
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{getBulkActionTitle()}</DialogTitle>
                        <DialogDescription>
                            {getBulkActionDescription()}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {bulkAction === "status" ? (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Status</label>
                                <Select value={bulkStatus} onValueChange={(value) => setBulkStatus(value as AppointmentStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
                                        <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
                                        <SelectItem value={AppointmentStatus.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                                        <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
                                        <SelectItem value={AppointmentStatus.NO_SHOW}>No Show</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Notes</label>
                                <Textarea
                                    placeholder="Enter notes for all selected appointments..."
                                    value={bulkNotes}
                                    onChange={(e) => setBulkNotes(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowBulkDialog(false)}
                            disabled={batchUpdate.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                setShowBulkDialog(false)
                                setShowBulkConfirmDialog(true)
                            }}
                            disabled={batchUpdate.isPending || (bulkAction === "notes" && !bulkNotes.trim())}
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Action Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showBulkConfirmDialog}
                onOpenChange={setShowBulkConfirmDialog}
                onConfirm={handleBulkAction}
                title={getBulkActionTitle()}
                description={getBulkActionDescription()}
                confirmText="Update All"
                cancelText="Cancel"
                confirmVariant="default"
                isLoading={batchUpdate.isPending}
                loadingText="Updating appointments..."
                icon={<Users className="h-5 w-5" />}
            />

            {/* Bulk Reminders Dialog */}
            <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Reminders ({selectedAppointments.length} appointments)</DialogTitle>
                        <DialogDescription>
                            Set reminders for all selected appointments. You can set reminders individually or use the same settings for all.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            Select an appointment to set its reminder:
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {selectedAppointmentDetails.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex items-center justify-between p-2 border rounded"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {appointment.patient_name || "Unknown Patient"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(appointment.appointment_date).toLocaleString()}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedAppointmentForReminder(appointment.id)
                                            setShowReminderDialog(false)
                                        }}
                                    >
                                        <Bell className="h-4 w-4 mr-2" />
                                        Set Reminder
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowReminderDialog(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Individual Reminder Dialog */}
            {selectedAppointmentForReminder && (
                <AppointmentReminders
                    appointmentId={selectedAppointmentForReminder}
                    appointmentDate={selectedAppointmentDetails.find(apt => apt.id === selectedAppointmentForReminder)?.appointment_date || ""}
                    variant="button"
                />
            )}
        </div>
    )
} 