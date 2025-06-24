"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Bell, Plus, Trash2, Mail, MessageSquare, Smartphone } from "lucide-react"
import { useCreateAppointmentReminder, useDeleteReminder, useMyReminders } from "@/lib/api/appointment.service"
import { AppointmentReminderCreate } from "@/types/appointment"

const ReminderSchema = z.object({
    reminder_time: z.string().min(1, "Reminder time is required"),
    reminder_type: z.enum(["email", "sms", "push"]),
})

interface AppointmentRemindersProps {
    appointmentId: string
    appointmentDate: string
    variant?: "button" | "badge"
}

export function AppointmentReminders({
    appointmentId,
    appointmentDate,
    variant = "button"
}: AppointmentRemindersProps) {
    const [isOpen, setIsOpen] = useState(false)
    const { data: reminders = [] } = useMyReminders(50)
    const createReminder = useCreateAppointmentReminder()
    const deleteReminder = useDeleteReminder()

    // Filter reminders for this specific appointment
    const appointmentReminders = reminders.filter(
        reminder => reminder.appointment_id === appointmentId
    )

    const form = useForm<z.infer<typeof ReminderSchema>>({
        resolver: zodResolver(ReminderSchema),
        defaultValues: {
            reminder_time: "1_hour",
            reminder_type: "email",
        },
    })

    const onSubmit = async (values: z.infer<typeof ReminderSchema>) => {
        try {
            const appointmentDateTime = new Date(appointmentDate)
            let reminderDateTime: Date

            // Calculate reminder time based on selection
            switch (values.reminder_time) {
                case "15_min":
                    reminderDateTime = new Date(appointmentDateTime.getTime() - 15 * 60 * 1000)
                    break
                case "30_min":
                    reminderDateTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000)
                    break
                case "1_hour":
                    reminderDateTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000)
                    break
                case "2_hours":
                    reminderDateTime = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000)
                    break
                case "1_day":
                    reminderDateTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000)
                    break
                default:
                    reminderDateTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000)
            }

            const reminderData: AppointmentReminderCreate = {
                appointment_id: appointmentId,
                reminder_time: reminderDateTime.toISOString(),
                reminder_type: values.reminder_type,
            }

            await createReminder.mutateAsync({ appointmentId, data: reminderData })
            setIsOpen(false)
            form.reset()
        } catch (error) {
            console.error("Error creating reminder:", error)
        }
    }

    const handleDeleteReminder = async (reminderId: string) => {
        try {
            await deleteReminder.mutateAsync(reminderId)
        } catch (error) {
            console.error("Error deleting reminder:", error)
        }
    }

    const getReminderTypeIcon = (type: string) => {
        switch (type) {
            case "email":
                return <Mail className="h-3 w-3" />
            case "sms":
                return <MessageSquare className="h-3 w-3" />
            case "push":
                return <Smartphone className="h-3 w-3" />
            default:
                return <Bell className="h-3 w-3" />
        }
    }

    const getReminderTypeLabel = (type: string) => {
        switch (type) {
            case "email":
                return "Email"
            case "sms":
                return "SMS"
            case "push":
                return "Push"
            default:
                return type
        }
    }

    const getTimeUntilReminder = (reminderTime: string) => {
        const now = new Date()
        const reminder = new Date(reminderTime)
        const diffMs = reminder.getTime() - now.getTime()

        if (diffMs <= 0) {
            return "Sent"
        }

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        if (diffHours > 24) {
            const diffDays = Math.floor(diffHours / 24)
            return `${diffDays} day${diffDays > 1 ? 's' : ''}`
        } else if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`
        } else {
            return `${diffMinutes}m`
        }
    }

    if (variant === "badge") {
        return (
            <div className="flex items-center gap-2">
                {appointmentReminders.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                        <Bell className="h-3 w-3 mr-1" />
                        {appointmentReminders.length} reminder{appointmentReminders.length > 1 ? 's' : ''}
                    </Badge>
                )}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            <Plus className="h-3 w-3 mr-1" />
                            Add Reminder
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Appointment Reminder</DialogTitle>
                            <DialogDescription>
                                Set a reminder for this appointment
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="reminder_time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>When to remind</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select reminder time" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="15_min">15 minutes before</SelectItem>
                                                    <SelectItem value="30_min">30 minutes before</SelectItem>
                                                    <SelectItem value="1_hour">1 hour before</SelectItem>
                                                    <SelectItem value="2_hours">2 hours before</SelectItem>
                                                    <SelectItem value="1_day">1 day before</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reminder_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reminder type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select reminder type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="sms">SMS</SelectItem>
                                                    <SelectItem value="push">Push Notification</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createReminder.isPending}>
                                        {createReminder.isPending ? "Adding..." : "Add Reminder"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Bell className="h-4 w-4 mr-2" />
                    Reminders ({appointmentReminders.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Appointment Reminders</DialogTitle>
                    <DialogDescription>
                        Manage reminders for this appointment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {appointmentReminders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No reminders set for this appointment
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {appointmentReminders.map((reminder) => (
                                <div
                                    key={reminder.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center space-x-2">
                                        {getReminderTypeIcon(reminder.reminder_type)}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {getReminderTypeLabel(reminder.reminder_type)} Reminder
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {getTimeUntilReminder(reminder.reminder_time)}
                                                {reminder.is_sent && " • Sent"}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteReminder(reminder.id)}
                                        disabled={deleteReminder.isPending}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="reminder_time"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>When to remind</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select reminder time" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="15_min">15 minutes before</SelectItem>
                                                    <SelectItem value="30_min">30 minutes before</SelectItem>
                                                    <SelectItem value="1_hour">1 hour before</SelectItem>
                                                    <SelectItem value="2_hours">2 hours before</SelectItem>
                                                    <SelectItem value="1_day">1 day before</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reminder_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reminder type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select reminder type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="email">Email</SelectItem>
                                                    <SelectItem value="sms">SMS</SelectItem>
                                                    <SelectItem value="push">Push Notification</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={createReminder.isPending}>
                                    {createReminder.isPending ? "Adding..." : "Add Reminder"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 