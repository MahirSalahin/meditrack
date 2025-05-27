"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Edit, Save, Camera, Phone, Shield, AlertTriangle, Plus, X } from "lucide-react"
import { useProfile } from "@/lib/api/services/patient/profile.service"
import { ProfileSkeleton } from "@/components/skeletons/patient/profile.skeleton"
import TitleHeader from "@/components/title-header"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading: loadingProfile, error } = useProfile()

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (loadingProfile) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return <div>No profile data found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <TitleHeader
          title="Profile"
          description="Manage your profile information"
        />
        <Button
          disabled={loadingProfile}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Personal Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                  {isEditing && (
                    <button className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary/90">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{`${profile.firstName} ${profile.lastName}`}</h3>
                  <p className="text-muted-foreground">Patient ID: {profile.id}</p>
                  <p className="text-sm text-muted-foreground">Member since {profile.memberSince}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    defaultValue={profile.firstName}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    defaultValue={profile.lastName}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={profile.email}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                  <Input
                    id="phone"
                    defaultValue={profile.phone}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-foreground">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    defaultValue={profile.dateOfBirth}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground">Gender</Label>
                  <Input
                    id="gender"
                    defaultValue={profile.gender}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Address</Label>
                <Textarea
                  id="address"
                  defaultValue={profile.address}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Medical Information</CardTitle>
              <CardDescription className="text-muted-foreground">Your health details and medical history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="text-foreground">Blood Type</Label>
                  <Input
                    id="bloodType"
                    defaultValue={profile.bloodType}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground">Height</Label>
                  <Input
                    id="height"
                    defaultValue={profile.height}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground">Weight</Label>
                  <Input
                    id="weight"
                    defaultValue={profile.weight}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>

              {/* Medical Conditions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium text-foreground">Medical Conditions</Label>
                  {isEditing && (
                    <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {profile.medicalConditions.map((condition) => (
                    <div key={condition.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{condition.condition}</p>
                        <p className="text-sm text-muted-foreground">Diagnosed: {condition.diagnosedDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
                          {condition.status}
                        </span>
                        {isEditing && (
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-medium text-foreground">Allergies</Label>
                  {isEditing && (
                    <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Allergy
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {profile.allergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium text-foreground">{allergy.allergen}</p>
                          <p className="text-sm text-muted-foreground">{allergy.reaction}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${allergy.severity === "Severe"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-secondary text-secondary-foreground"
                            }`}
                        >
                          {allergy.severity}
                        </span>
                        {isEditing && (
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emergency Contacts */}
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-card-foreground">Emergency Contacts</CardTitle>
                {isEditing && (
                  <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.emergencyContacts.map((contact) => (
                <div key={contact.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{contact.name}</p>
                    {isEditing && (
                      <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {contact.phone}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Insurance Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Primary Insurance</Label>
                <p className="text-sm font-semibold text-foreground">{profile.insurance.provider}</p>
                <p className="text-sm text-muted-foreground">Policy #: {profile.insurance.policyNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Group Number</Label>
                <p className="text-sm text-foreground">{profile.insurance.groupNumber}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Member ID</Label>
                <p className="text-sm text-foreground">{profile.insurance.memberId}</p>
              </div>
              {isEditing && (
                <Button size="sm" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Insurance
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">Privacy & Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                </div>
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Data Sharing</p>
                  <p className="text-xs text-muted-foreground">Control who can access your data</p>
                </div>
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <Shield className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              </div>
              <Button size="sm" variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Download My Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
