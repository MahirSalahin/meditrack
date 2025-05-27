import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Pill, FileText } from "lucide-react"
import { usePrescriptionStats } from "@/lib/api/services/patient/prescription.service"
import { PrescriptionStatusSkeleton } from "@/components/skeletons/patient/prescription.skeleton"

export function PrescriptionStats() {
    const { data: stats, isLoading, error } = usePrescriptionStats()

    if (error) {
        return <div>Error loading prescription stats</div>
    }

    if (isLoading) {
        return <PrescriptionStatusSkeleton />
    }

    if (!stats) return null

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-background shadow-sm border-0">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active</p>
                            <p className="text-2xl font-bold">{stats.active}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-background shadow-sm border-0">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-500 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pending</p>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-background shadow-sm border-0">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <Pill className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Refills</p>
                            <p className="text-2xl font-bold">{stats.totalRefills}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-background shadow-sm border-0">
                <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 