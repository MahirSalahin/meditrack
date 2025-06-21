"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, TrendingUp, LucideIcon } from "lucide-react"
import { useAppointmentStats } from "@/lib/api/appointment.service"
import { AppointmentStatusCardSkeleton } from "@/components/skeletons/patient/appointment.skeleton"

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
            <CardContent className="px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className={`text-3xl font-bold ${color}`}>
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

export default function AppointmentStats() {
    const { data: statsData, isLoading: isLoadingStats } = useAppointmentStats()

    if (isLoadingStats) {
        return (
            <div className="grid gap-4 md:grid-cols-4">
                <AppointmentStatusCardSkeleton />
                <AppointmentStatusCardSkeleton />
                <AppointmentStatusCardSkeleton />
                <AppointmentStatusCardSkeleton />
            </div>
        )
    }

    const stats = [
        {
            title: "Upcoming",
            value: statsData?.upcoming_count || 0,
            description: "Next 30 days",
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Completed",
            value: statsData?.completed || 0,
            description: "This month",
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "Scheduled",
            value: statsData?.scheduled || 0,
            description: "Awaiting confirmation",
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100"
        },
        {
            title: "Total",
            value: statsData?.total_appointments || 0,
            description: "All time",
            icon: TrendingUp,
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