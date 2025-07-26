import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMedicationsStats } from "@/lib/api/services/patient/medications.service"

export function MedicationSidebar() {
    const { data: statsData, isLoading: isLoadingStats, error: statsError } = useMedicationsStats()

    if (statsError) {
        return <div>Error loading sidebar data</div>
    }

    return (
        <div className="space-y-6">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Medication Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingStats ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="text-lg font-semibold">
                            Active Medications: {statsData?.activeMedications ?? 0}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 