import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function AppointmentCardSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="h-3 w-20 mb-2" />
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    ))}
                </div>

                {/* Notes Section */}
                <div className="bg-muted rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-2">
                        <Skeleton className="h-4 w-4 mt-0.5" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-1">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-9 w-32" />
                </div>
            </CardContent>
        </Card>
    )
}

export function AppointmentStatusCardSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-12 w-12 rounded-full" />
                </div>
            </CardContent>
        </Card>
    )
}