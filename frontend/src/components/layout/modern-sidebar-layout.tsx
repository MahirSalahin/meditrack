"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SettingsPanel } from "@/components/providers/settings-panel"
import {
  Home,
  User,
  Pill,
  FileText,
  Calendar,
  FolderOpen,
  Settings,
  Menu,
  Users,
  Activity,
  Search,
  Bell,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/api/auth.service"

interface ModernSidebarLayoutProps {
  children: React.ReactNode
  userType: "patient" | "doctor"
}

export function ModernSidebarLayout({ children, userType }: ModernSidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const patientNavItems = [
    {
      section: "OVERVIEW",
      items: [
        { icon: Home, label: "Dashboard", href: "/patient/dashboard", active: false },
      ],
    },
    {
      section: "HEALTH",
      items: [
        { icon: Pill, label: "Medications", href: "/patient/medications", active: false },
        { icon: Calendar, label: "Appointments", href: "/patient/appointments", active: false },
        { icon: FileText, label: "Prescriptions", href: "/patient/prescriptions", active: false },
        { icon: FolderOpen, label: "Medical Records", href: "/patient/records", active: false },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { icon: User, label: "Profile", href: "/patient/profile", active: false },
        { icon: Settings, label: "Settings", href: "/patient/settings", active: false },
      ],
    },
  ]

  const doctorNavItems = [
    {
      section: "OVERVIEW",
      items: [
        { icon: Home, label: "Dashboard", href: "/doctor/dashboard", active: false },
        { icon: Users, label: "Patients", href: "/doctor/patients", active: false },
      ],
    },
    {
      section: "PRACTICE",
      items: [
        { icon: Calendar, label: "Appointments", href: "/doctor/appointments", active: false },
      ],
    },
    {
      section: "MANAGEMENT",
      items: [
        { icon: User, label: "Profile", href: "/doctor/profile", active: false },
        { icon: Settings, label: "Settings", href: "/doctor/settings", active: false },
      ],
    },
  ]

  const navSections = userType === "patient" ? patientNavItems : doctorNavItems

  const SidebarContent = () => {
    const pathname = usePathname()

    return (
      <div className="flex h-full w-64 flex-col bg-background border-r border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediTrack</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.section} className="space-y-3">
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.section}</h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex w-full justify-start h-10 px-3 items-center rounded-md transition-colors text-sm",
                        isActive
                          ? "bg-primary/15 text-primary font-medium hover:bg-primary/15 hover:text-primary"
                          : "text-muted-foreground hover:text-primary"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Logout Section */}
          <div className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={async () => {
                await logout()
              }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </nav>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden bg-card shadow-md border border-border">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <header className="flex h-16 items-center justify-between  bg-background shadow-sm px-6 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground ml-12 md:ml-0">
            {userType === "patient" ? "Patient Portal" : "Doctor Portal"}
          </h1>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-secondary/50">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-secondary/50">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary hover:bg-secondary/50"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="p-6 bg-background">{children}</main>
      </div>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}