import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuickActions } from "@/lib/api/services/patient/medication.service"

export function QuickActions() {
    const { data, isLoading, error } = useQuickActions()

    if (error) {
        return <div>Error loading quick actions</div>
    }

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                                <Skeleton className="h-10 w-10 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!data) return null

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-600">Next Dose</p>
                            <p className="text-lg font-bold text-blue-700 dark:text-blue-500">
                                {data.nextDose.name} in {data.nextDose.timeLeft}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-600">Taken Today</p>
                            <p className="text-lg font-bold text-green-700 dark:text-green-500">{data.takenToday}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-500 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-900 dark:text-red-600">Missed Doses</p>
                            <p className="text-lg font-bold text-red-700 dark:text-red-500">
                                {data.missedCount} medication
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 