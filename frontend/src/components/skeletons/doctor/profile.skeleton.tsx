import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function DoctorProfileSkeleton() {
    return (
        <div className="container mx-auto px-4 space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Basic Info Card Skeleton */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <Skeleton key={i} className="h-6 w-32" />
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                            <Skeleton className="h-4 w-4" />
                                            <Skeleton className="h-4 w-48" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Professional Information Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-5" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                    </div>
                                    {i < 3 && <Skeleton className="h-px w-full my-4" />}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Working Hours Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-5" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Education Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-5" />
                        </div>
                        <div className="space-y-6">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="relative pl-6">
                                    <Skeleton className="absolute left-0 top-0 h-2 w-2 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-64" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Certifications Skeleton */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-5 w-5" />
                        </div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                                    <Skeleton className="h-5 w-5 mt-0.5" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-64" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 