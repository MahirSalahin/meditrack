"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, CalendarIcon } from "lucide-react"
import { AppointmentStatus, AppointmentType } from "@/types/appointment"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AdvancedSearchFilters {
    searchTerm: string
    status: AppointmentStatus | "all"
    appointmentType: AppointmentType | "all"
    dateFrom: Date | null
    dateTo: Date | null
    doctorName: string
    specialization: string
}

interface AdvancedAppointmentSearchProps {
    onFiltersChange: (filters: AdvancedSearchFilters) => void
    showDoctorFields?: boolean
    showPatientFields?: boolean
    className?: string
}

export function AdvancedAppointmentSearch({
    onFiltersChange,
    showDoctorFields = false,
    showPatientFields = false,
    className
}: AdvancedAppointmentSearchProps) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
    const [filters, setFilters] = useState<AdvancedSearchFilters>({
        searchTerm: "",
        status: "all",
        appointmentType: "all",
        dateFrom: null,
        dateTo: null,
        doctorName: "",
        specialization: "",
    })

    const handleFilterChange = (
        key: keyof AdvancedSearchFilters,
        value: AppointmentStatus | "all" | AppointmentType | Date | string | undefined
    ) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFiltersChange(newFilters)
    }

    const clearFilters = () => {
        const clearedFilters: AdvancedSearchFilters = {
            searchTerm: "",
            status: "all",
            appointmentType: "all",
            dateFrom: null,
            dateTo: null,
            doctorName: "",
            specialization: "",
        }
        setFilters(clearedFilters)
        onFiltersChange(clearedFilters)
    }

    const hasActiveFilters = filters.status !== "all" ||
        filters.appointmentType !== "all" ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.doctorName ||
        filters.specialization

    return (
        <div className={cn("space-y-4", className)}>
            {/* Basic Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search appointments..."
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Select
                        value={filters.status}
                        onValueChange={(value) => handleFilterChange("status", value as AppointmentStatus | "all")}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value={AppointmentStatus.SCHEDULED}>Scheduled</SelectItem>
                            <SelectItem value={AppointmentStatus.CONFIRMED}>Confirmed</SelectItem>
                            <SelectItem value={AppointmentStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem value={AppointmentStatus.COMPLETED}>Completed</SelectItem>
                            <SelectItem value={AppointmentStatus.CANCELLED}>Cancelled</SelectItem>
                            <SelectItem value={AppointmentStatus.NO_SHOW}>No Show</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.appointmentType}
                        onValueChange={(value) => handleFilterChange("appointmentType", value as AppointmentType | "all")}
                    >
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value={AppointmentType.CONSULTATION}>Consultation</SelectItem>
                            <SelectItem value={AppointmentType.FOLLOW_UP}>Follow-up</SelectItem>
                            <SelectItem value={AppointmentType.CHECKUP}>Checkup</SelectItem>
                            <SelectItem value={AppointmentType.EMERGENCY}>Emergency</SelectItem>
                            <SelectItem value={AppointmentType.VIRTUAL}>Virtual</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        className={cn(
                            "flex items-center gap-2",
                            hasActiveFilters && "border-primary text-primary"
                        )}
                    >
                        <Filter className="h-4 w-4" />
                        Advanced
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                                {Object.values(filters).filter(v => v && v !== "all").length}
                            </Badge>
                        )}
                    </Button>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {filters.status !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Status: {filters.status}
                            <X
                                className="h-3 w-3 ml-1 cursor-pointer"
                                onClick={() => handleFilterChange("status", "all")}
                            />
                        </Badge>
                    )}
                    {filters.appointmentType !== "all" && (
                        <Badge variant="secondary" className="text-xs">
                            Type: {filters.appointmentType}
                            <X
                                className="h-3 w-3 ml-1 cursor-pointer"
                                onClick={() => handleFilterChange("appointmentType", "all")}
                            />
                        </Badge>
                    )}
                    {filters.dateFrom && (
                        <Badge variant="secondary" className="text-xs">
                            From: {format(filters.dateFrom, "MMM dd")}
                            <X
                                className="h-3 w-3 ml-1 cursor-pointer"
                                onClick={() => handleFilterChange("dateFrom", undefined)}
                            />
                        </Badge>
                    )}
                    {filters.dateTo && (
                        <Badge variant="secondary" className="text-xs">
                            To: {format(filters.dateTo, "MMM dd")}
                            <X
                                className="h-3 w-3 ml-1 cursor-pointer"
                                onClick={() => handleFilterChange("dateTo", undefined)}
                            />
                        </Badge>
                    )}
                    {filters.doctorName && (
                        <Badge variant="secondary" className="text-xs">
                            Doctor: {filters.doctorName}
                            <X
                                className="h-3 w-3 ml-1 cursor-pointer"
                                onClick={() => handleFilterChange("doctorName", "")}
                            />
                        </Badge>
                    )}
                    {filters.specialization && (
                        <Badge variant="secondary" className="text-xs">
                            Specialization: {filters.specialization}
                            <X
                                className="h-3 w-3 ml-1 cursor-pointer"
                                onClick={() => handleFilterChange("specialization", "")}
                            />
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 px-2 text-xs"
                    >
                        Clear all
                    </Button>
                </div>
            )}

            {/* Advanced Filters */}
            {isAdvancedOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
                    {/* Date Range */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date Range</label>
                        <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !filters.dateFrom && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateFrom || undefined}
                                        onSelect={(date) => handleFilterChange("dateFrom", date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !filters.dateTo && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {filters.dateTo ? format(filters.dateTo, "MMM dd") : "To"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={filters.dateTo || undefined}
                                        onSelect={(date) => handleFilterChange("dateTo", date)}
                                        disabled={(date) => filters.dateFrom ? date < filters.dateFrom : false}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Doctor Name */}
                    {showPatientFields && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Doctor Name</label>
                            <Input
                                placeholder="Search by doctor name"
                                value={filters.doctorName}
                                onChange={(e) => handleFilterChange("doctorName", e.target.value)}
                                className="h-9"
                            />
                        </div>
                    )}

                    {/* Specialization */}
                    {showPatientFields && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Specialization</label>
                            <Input
                                placeholder="e.g., Cardiology, Pediatrics"
                                value={filters.specialization}
                                onChange={(e) => handleFilterChange("specialization", e.target.value)}
                                className="h-9"
                            />
                        </div>
                    )}

                    {/* Patient Name (for doctors) */}
                    {showDoctorFields && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Patient Name</label>
                            <Input
                                placeholder="Search by patient name"
                                value={filters.doctorName} // Reusing doctorName field for patient search
                                onChange={(e) => handleFilterChange("doctorName", e.target.value)}
                                className="h-9"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
} 