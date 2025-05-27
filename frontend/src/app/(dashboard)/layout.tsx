import React from 'react'
import { ThemeProvider as NextThemeProvider } from "next-themes"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      { children }
    </NextThemeProvider>
  )
}
