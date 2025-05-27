import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, CheckCircle, Bell, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMedicationsList } from "@/lib/api/services/patient/medication.service"

export function MedicationsList() {
    const { data: medications, isLoading, error } = useMedicationsList()

    if (error) {
        return <div>Error loading medications</div>
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-6 w-48 mb-4" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start space-x-4">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-36" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-5 w-24" />
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-lg p-4 mb-4 bg-muted space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <Skeleton key={j} className="h-9 w-32" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!medications?.length) return null

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Current Medications</h2>
            {medications.map((medication) => (
                <Card key={medication.id} className="shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className={`p-3 rounded-lg ${medication.color} text-white`}>
                                    <Pill className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{medication.name}</h3>
                                    <p className="text-sm text-muted-foreground">{medication.genericName}</p>
                                    <p className="text-sm text-muted-foreground">Prescribed by {medication.prescribedBy}</p>
                                </div>
                            </div>
                            <Badge
                                variant={medication.status === "missed" ? "destructive" : "default"}
                                className={medication.status === "active" ? "bg-green-100 text-green-800" : ""}
                            >
                                {medication.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Dosage</p>
                                <p className="text-sm font-semibold">{medication.dosage}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Frequency</p>
                                <p className="text-sm font-semibold">{medication.frequency}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Next Dose</p>
                                <p
                                    className={`text-sm font-semibold ${medication.status === "missed" ? "text-red-600" : ""}`}
                                >
                                    {medication.nextDose}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase">Refills Left</p>
                                <p className="text-sm font-semibold">{medication.refillsLeft}</p>
                            </div>
                        </div>

                        <div className="rounded-lg p-4 mb-4 bg-muted">
                            <p className="text-sm text-muted-foreground mb-2">
                                <span className="font-medium">Instructions:</span> {medication.instructions}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium">Side Effects:</span> {medication.sideEffects}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button size="sm">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Taken
                            </Button>
                            <Button size="sm" variant="outline">
                                <Bell className="h-4 w-4 mr-2" />
                                Set Reminder
                            </Button>
                            <Button size="sm" variant="outline">
                                <Calendar className="h-4 w-4 mr-2" />
                                View Schedule
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 