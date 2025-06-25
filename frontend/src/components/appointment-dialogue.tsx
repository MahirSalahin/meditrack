"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useCreateAppointment, useUpdateAppointment } from "@/lib/api/appointment.service"
import { AppointmentRead, AppointmentType } from "@/types/appointment"
import { useEffect } from "react"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const AppointmentSchema = z.object({
    doctor_id: z.string().min(1, "Doctor is required"),
    appointment_date: z.date({
        required_error: "Appointment date is required",
    }),
    appointment_type: z.nativeEnum(AppointmentType),
    reason: z.string().optional(),
    notes: z.string().optional(),
})

interface AppointmentDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    appointment?: AppointmentRead;
    doctorId?: string; // Pre-selected doctor
}

export function AppointmentDialog({
    isOpen,
    onOpenChange,
    appointment,
    doctorId
}: AppointmentDialogProps) {
    const { mutateAsync: createAppointment, isPending: isCreating } = useCreateAppointment()
    const { mutateAsync: updateAppointment, isPending: isUpdating } = useUpdateAppointment()

    const form = useForm<z.infer<typeof AppointmentSchema>>({
        resolver: zodResolver(AppointmentSchema),
        defaultValues: {
            doctor_id: doctorId || appointment?.doctor_id || "",
            appointment_date: appointment?.appointment_date ? new Date(appointment.appointment_date) : new Date(),
            appointment_type: appointment?.appointment_type || AppointmentType.CONSULTATION,
            reason: appointment?.reason || "",
            notes: appointment?.notes || "",
        },
    })

    useEffect(() => {
        if (appointment) {
            form.reset({
                doctor_id: appointment.doctor_id,
                appointment_date: new Date(appointment.appointment_date),
                appointment_type: appointment.appointment_type,
                reason: appointment.reason || "",
                notes: appointment.notes || "",
            })
        } else if (doctorId) {
            form.reset({
                doctor_id: doctorId,
                appointment_date: new Date(),
                appointment_type: AppointmentType.CONSULTATION,
                reason: "",
                notes: "",
            })
        }
    }, [appointment, doctorId, form])

    async function onSubmit(values: z.infer<typeof AppointmentSchema>) {
        try {
            if (appointment) {
                await updateAppointment({
                    appointmentId: appointment.id,
                    data: {
                        appointment_date: values.appointment_date.toISOString(),
                        appointment_type: values.appointment_type,
                        reason: values.reason,
                        notes: values.notes,
                    }
                })
            } else {
                await createAppointment({
                    doctor_id: values.doctor_id,
                    appointment_date: values.appointment_date.toISOString(),
                    appointment_type: values.appointment_type,
                    reason: values.reason,
                    notes: values.notes,
                })
            }

            form.reset()
            onOpenChange(false)
        } catch (error) {
            // Error handling is done in the mutation hooks
            console.error("Appointment submission error:", error)
        }
    }

    const title = appointment ? "Edit Appointment" : "Schedule Appointment"
    const description = appointment ? "Update the appointment details below." : "Fill in the details to schedule a new appointment."

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="doctor_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Doctor ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter doctor ID"
                                            {...field}
                                            disabled={!!doctorId} // Disable if doctor is pre-selected
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="appointment_date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Appointment Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date < new Date()
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="appointment_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Appointment Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select appointment type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={AppointmentType.CONSULTATION}>Consultation</SelectItem>
                                            <SelectItem value={AppointmentType.FOLLOW_UP}>Follow-up</SelectItem>
                                            <SelectItem value={AppointmentType.CHECKUP}>Check-up</SelectItem>
                                            <SelectItem value={AppointmentType.EMERGENCY}>Emergency</SelectItem>
                                            <SelectItem value={AppointmentType.VIRTUAL}>Virtual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reason for Visit</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter the reason for your appointment"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Additional notes or instructions"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isCreating || isUpdating}
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {isCreating || isUpdating ?
                                    (isUpdating ? "Updating..." : "Creating...") :
                                    (appointment ? "Update Appointment" : "Create Appointment")
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
} 