import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { QueryProvider } from "@/components/providers/query-provider"
import MyLayout from "@/components/layout/MyLayout"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediTrack - Digital Health & Wellness Platform",
  description:
    "A comprehensive digital health platform for managing medical records, tracking medications, and connecting with healthcare providers.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Toaster />
        <MyLayout>
            <QueryProvider>
              {children}
            </QueryProvider>
        </MyLayout>
      </body>
    </html>
  )
}
