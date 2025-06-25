"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, LucideIcon, AlertCircle, Stethoscope } from "lucide-react"
import { useAppointmentStats } from "@/lib/api/appointment.service"
import { AppointmentStatsSkeleton } from "@/components/skeletons/doctor/appointments.skeleton"

interface StatCardProps {
    title: string
    value: number
    description: string
    icon: LucideIcon
    color: string
    bgColor: string
}

function StatCard({ title, value, description, icon: Icon, color, bgColor }: StatCardProps) {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className={`text-2xl font-bold ${color}`}>
                            {value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {description}
                        </p>
                    </div>
                    <div className={`p-3 ${bgColor} rounded-full`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function DoctorAppointmentStats() {
    const { data: statsData, isLoading: isLoadingStats } = useAppointmentStats()

    if (isLoadingStats) {
        return <AppointmentStatsSkeleton />
    }

    const stats = [
        {
            title: "Total Appointments",
            value: statsData?.total_appointments || 0,
            description: "All time",
            icon: Calendar,
            color: "text-gray-600",
            bgColor: "bg-gray-100"
        },
        {
            title: "Today",
            value: statsData?.today_count || 0,
            description: "Scheduled for today",
            icon: Clock,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Upcoming",
            value: statsData?.upcoming_count || 0,
            description: "Next 30 days",
            icon: AlertCircle,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Completed",
            value: statsData?.completed || 0,
            description: "This month",
            icon: Stethoscope,
            color: "text-purple-600",
            bgColor: "bg-purple-100"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    )
} 