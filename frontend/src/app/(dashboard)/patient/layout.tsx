import React from 'react'
import { ModernSidebarLayout } from '@/components/layout/modern-sidebar-layout'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ModernSidebarLayout userType="patient">
      {children}
    </ModernSidebarLayout>
  )
}
