"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useDoctorProfile } from "@/lib/api/services/doctor/profile.service"
import { DoctorProfileSkeleton } from "@/components/skeletons/doctor/profile.skeleton"
import { Mail, Phone, MapPin, Building2, GraduationCap, Award, Clock, Calendar, Edit2, Star, Users, Activity } from "lucide-react"

export default function DoctorProfilePage() {
    const { data: profile, isLoading } = useDoctorProfile()

    if (isLoading) {
        return <DoctorProfileSkeleton />
    }

    return (
        <div className="container mx-auto px-4 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Doctor Profile</h1>
                <p className="text-muted-foreground">View and manage your professional profile</p>
            </div>

            {/* Basic Info Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex items-start gap-6">
                            <div className="h-32 w-32 rounded-full bg-primary/15 dark:bg-primary/40 flex items-center justify-center">
                                <span className="text-4xl font-semibold">
                                    {profile?.name.split(" ").map(n => n[0]).join("")}
                                </span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-semibold">{profile?.name}</h2>
                                    <p className="text-muted-foreground">{profile?.specialization}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        <span>15 Years Experience</span>
                                    </Badge>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        <span>500+ Patients</span>
                                    </Badge>
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        <Activity className="h-3 w-3" />
                                        <span>98% Satisfaction</span>
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{profile?.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{profile?.phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        <span>{profile?.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Edit2 className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Professional Information */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Professional Information</h3>
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">License Number</span>
                                <span className="font-medium">{profile?.licenseNumber}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Years of Experience</span>
                                <span className="font-medium">{profile?.yearsOfExperience} years</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Hospital Affiliation</span>
                                <span className="font-medium">{profile?.hospitalAffiliation}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Department</span>
                                <span className="font-medium">{profile?.department}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Working Hours */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Working Hours</h3>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            {profile?.workingHours.map((hours, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{hours.days}</span>
                                    </div>
                                    <Badge variant="outline">{hours.time}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Education */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Education & Qualifications</h3>
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-6">
                            {profile?.education.map((edu, index) => (
                                <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-border">
                                    <div className="absolute left-0 top-0 h-2 w-2 rounded-full bg-primary" />
                                    <p className="font-medium">{edu.degree}</p>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Specializations & Certifications</h3>
                            <Award className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-4">
                            {profile?.certifications.map((cert, index) => (
                                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg bg-muted/50">
                                    <Award className="h-5 w-5 mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-medium">{cert.name}</p>
                                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                                        <p className="text-sm text-muted-foreground">{cert.year}</p>
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