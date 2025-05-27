import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function PrescriptionCardSkeleton() {
    return (
        <Card className="shadow-sm border-0">
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
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-28" />
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

                {/* Instructions Section */}
                <div className="bg-foreground/10 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                        <div>
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-1">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardContent>
        </Card>
    )
}

export function PrescriptionStatusSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-background shadow-sm border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div>
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-8 w-12" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function PrescriptionListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <PrescriptionCardSkeleton key={i} />
            ))}
        </div>
    )
}