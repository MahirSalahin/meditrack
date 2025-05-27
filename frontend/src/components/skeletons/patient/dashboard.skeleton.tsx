import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function StatsCardSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function HealthMetricSkeleton() {
  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  )
}

export function AppointmentCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}

export function MedicationCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  )
}
