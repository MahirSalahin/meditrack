import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import TitleHeader from '@/components/title-header'

export default function SettingsPage() {
    return (
        <div className="container mx-auto px-4 space-y-6">
            <TitleHeader
                title="Settings"
            />
            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Appointment Reminders</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications for upcoming appointments</p>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Medication Alerts</Label>
                            <p className="text-sm text-muted-foreground">Get reminders for medication schedules</p>
                        </div>
                        <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Test Results</Label>
                            <p className="text-sm text-muted-foreground">Notifications when new test results are available</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
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
                    <CardTitle>Account Security</CardTitle>
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
    )
}
