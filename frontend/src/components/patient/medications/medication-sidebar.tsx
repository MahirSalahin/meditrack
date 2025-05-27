import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTodaySchedule, useMedicationStats } from "@/lib/api/services/patient/medication.service"
import { MedicationStatsSkeleton, TodayScheduleSkeleton } from "@/components/skeletons/patient/medication.skeleton"

export function MedicationSidebar() {
    const { data: scheduleData, isLoading: isLoadingSchedule, error: scheduleError } = useTodaySchedule()
    const { data: statsData, isLoading: isLoadingStats, error: statsError } = useMedicationStats()

    if (scheduleError || statsError) {
        return <div>Error loading sidebar data</div>
    }

    return (
        <div className="space-y-6">
            {/* Today's Schedule */}
            {isLoadingSchedule ? (
                <TodayScheduleSkeleton />
            ) : (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Today&#39;s Schedule</CardTitle>
                        <CardDescription>Upcoming medication times</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {scheduleData?.map((dose, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                <div>
                                    <p className="font-medium">{dose.medication}</p>
                                    <p className="text-sm text-muted-foreground">{dose.time}</p>
                                </div>
                                <Badge variant="secondary">{dose.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Quick Stats */}
            {isLoadingStats ? (
                <MedicationStatsSkeleton />
            ) : (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Medication Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Active Medications</span>
                            <span className="font-semibold">{statsData?.activeMedications}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Adherence Rate</span>
                            <span className="font-semibold text-green-600">{statsData?.adherenceRate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Doses This Week</span>
                            <span className="font-semibold">{statsData?.dosesThisWeek}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Refills Needed</span>
                            <span className="font-semibold text-orange-600">{statsData?.refillsNeeded}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 