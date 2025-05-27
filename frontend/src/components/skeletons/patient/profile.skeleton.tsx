import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ProfileSkeleton() {
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

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Personal Information Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Profile Picture and Name */}
                            <div className="flex items-center space-x-6">
                                <Skeleton className="w-24 h-24 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-36" />
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Address Field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Medical Information Card */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Medical Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Medical Conditions */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-8 w-32" />
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: 2 }).map((_, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <Skeleton className="h-5 w-5" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-32" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Skeleton */}
                <div className="space-y-6">
                    {/* Emergency Contacts Card */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="p-3 border border-border rounded-lg space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Insurance Information Card */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-28" />
                                </div>
                            ))}
                            <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>

                    {/* Privacy Settings Card */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <Skeleton className="h-8 w-24" />
                                </div>
                            ))}
                            <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}