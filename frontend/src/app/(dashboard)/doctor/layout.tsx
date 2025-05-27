import React from 'react'
import { ModernSidebarLayout } from '@/components/layout/modern-sidebar-layout'

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ModernSidebarLayout userType="doctor">
      {children}
    </ModernSidebarLayout>
  )
}
