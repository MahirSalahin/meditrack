import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function RecordCardSkeleton() {
    return (
        <Card className="shadow-sm border-0">
            <CardContent className="p-6">
                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <Skeleton className="h-4 w-full mb-2" />
                            <div className="flex flex-wrap gap-1 mb-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-16" />
                                ))}
                            </div>
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

                {/* Footer Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-1">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-9 w-32" />
                </div>
            </CardContent>
        </Card>
    )
}

export function RecordCategorySkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
            {Array.from({ length: 7 }).map((_, i) => (
                <Card key={i} className="bg-background shadow-sm border">
                    <CardContent className="p-4 text-center">
                        <Skeleton className="h-10 w-10 rounded-lg mx-auto mb-2" />
                        <Skeleton className="h-4 w-20 mx-auto mb-1" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export function RecordListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <RecordCardSkeleton key={i} />
            ))}
        </div>
    )
}
