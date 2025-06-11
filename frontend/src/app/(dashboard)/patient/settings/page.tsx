import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import TitleHeader from '@/components/title-header'
import { User } from "lucide-react"
import { Bell } from "lucide-react"
import { Shield } from "lucide-react"
import { Lock } from "lucide-react"


export default function SettingsPage() {
    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="Settings"
                description="Manage your account settings and preferences"
            />

            <div className="grid gap-6">
            {/* Profile Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Profile Settings</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" defaultValue="Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="john.doe@email.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" defaultValue="+1 (555) 123-4567" />
                        </div>
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Notifications</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Appointment Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                                Get reminded about upcoming appointments
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Medication Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive notifications for medication times
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Test Results</Label>
                            <p className="text-sm text-muted-foreground">
                                Get notified when test results are available
                            </p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Privacy Settings</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Share Medical History</Label>
                            <p className="text-sm text-muted-foreground">Allow doctors to view your complete medical history</p>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Data Collection</Label>
                            <p className="text-sm text-muted-foreground">Allow anonymous data collection for research</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Lock className="h-5 w-5" />
                        <span>Account Security</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                    </div>
                    <Button>Update Password</Button>
                </CardContent>
            </Card>

            {/* Medical Information Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Medical Information Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Emergency Contact Access</Label>
                            <p className="text-sm text-muted-foreground">Allow emergency contacts to access your medical information</p>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Insurance Information</Label>
                            <p className="text-sm text-muted-foreground">Share insurance information with healthcare providers</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    )
}
