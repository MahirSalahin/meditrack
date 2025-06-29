"use client"

import React, { useState, useEffect } from 'react'
import { useSearchDoctors } from '@/lib/api/profile.service'
import { DoctorSearchParams, DoctorSearchResult } from '@/types/profile'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, User, Building, Star, DollarSign, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DoctorSearchProps {
    onDoctorSelect: (doctor: DoctorSearchResult) => void
    selectedDoctorId?: string
    className?: string
}

export function DoctorSearch({ onDoctorSelect, selectedDoctorId, className }: DoctorSearchProps) {
    const [searchParams, setSearchParams] = useState<DoctorSearchParams>({
        page: 1,
        page_size: 10
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [specialization, setSpecialization] = useState('all')
    const [isVerified, setIsVerified] = useState<string>('all')

    const { data: searchResults, isLoading, error } = useSearchDoctors(searchParams)

    // Update search params when filters change
    useEffect(() => {
        const newParams: DoctorSearchParams = {
            page: 1,
            page_size: 10
        }

        if (searchTerm.trim()) {
            newParams.name = searchTerm.trim()
        }
        if (specialization && specialization !== 'all') {
            newParams.specialization = specialization
        }
        if (isVerified && isVerified !== 'all') {
            newParams.is_verified = isVerified === 'true'
        }

        setSearchParams(newParams)
    }, [searchTerm, specialization, isVerified])

    const handleDoctorClick = (doctor: DoctorSearchResult) => {
        onDoctorSelect(doctor)
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSpecialization('all')
        setIsVerified('all')
    }

    const hasActiveFilters = searchTerm || specialization !== 'all' || isVerified !== 'all'

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search and Filter Controls */}
            <div className="space-y-3">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search doctors by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {hasActiveFilters && (
                        <Button variant="outline" onClick={clearFilters} size="sm">
                            Clear
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Select value={specialization} onValueChange={setSpecialization}>
                        <SelectTrigger>
                            <SelectValue placeholder="Specialization" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Specializations</SelectItem>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Dermatology">Dermatology</SelectItem>
                            <SelectItem value="Neurology">Neurology</SelectItem>
                            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                            <SelectItem value="General Medicine">General Medicine</SelectItem>
                            <SelectItem value="Surgery">Surgery</SelectItem>
                            <SelectItem value="Oncology">Oncology</SelectItem>
                            <SelectItem value="Emergency Medicine">Emergency Medicine</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={isVerified} onValueChange={setIsVerified}>
                        <SelectTrigger>
                            <SelectValue placeholder="Verification" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Doctors</SelectItem>
                            <SelectItem value="true">Verified Only</SelectItem>
                            <SelectItem value="false">Unverified Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Search Results */}
            <div className="space-y-3">
                {isLoading ? (
                    // Loading skeletons
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : error ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Error loading doctors. Please try again.</p>
                    </div>
                ) : searchResults?.doctors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No doctors found matching your criteria.</p>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters} className="mt-2">
                                Clear filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {searchResults?.doctors.map((doctor) => (
                            <Card
                                key={doctor.id}
                                className={cn(
                                    "cursor-pointer hover:shadow-md transition-shadow",
                                    selectedDoctorId === doctor.id && "ring-2 ring-primary"
                                )}
                                onClick={() => handleDoctorClick(doctor)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <h3 className="font-semibold text-sm truncate">
                                                    {doctor.doctor_name}
                                                </h3>
                                                {doctor.is_verified && (
                                                    <Badge variant="default" className="text-xs">
                                                        <Star className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {doctor.specialization}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                                {doctor.hospital_affiliation && (
                                                    <div className="flex items-center space-x-1">
                                                        <Building className="h-3 w-3" />
                                                        <span className="truncate">{doctor.hospital_affiliation}</span>
                                                    </div>
                                                )}
                                                {doctor.years_of_experience && (
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>{doctor.years_of_experience} years</span>
                                                    </div>
                                                )}
                                                {doctor.consultation_fee && (
                                                    <div className="flex items-center space-x-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>${doctor.consultation_fee}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Info */}
            {searchResults && searchResults.total_count > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Showing {searchResults.doctors.length} of {searchResults.total_count} doctors
                </div>
            )}
        </div>
    )
} 