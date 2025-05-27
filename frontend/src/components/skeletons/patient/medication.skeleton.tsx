import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function MedicationSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>

            {/* Quick Actions Skeleton */}
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

            {/* Search and Filter Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Medications List Skeleton */}
                <div className="lg:col-span-2 space-y-4">
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

                {/* Sidebar Skeleton */}
                <div className="space-y-6">
                    {/* Today's Schedule Skeleton */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-48" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Stats Skeleton */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export function TodayScheduleSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

export function MedicationStatsSkeleton() {
    return (
        <Card className="shadow-sm">
            <CardHeader>
                <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}