import React from 'react'
import { ThemeProvider as NextThemeProvider } from "next-themes"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemeProvider forcedTheme='light' enableSystem>
      { children }
    </NextThemeProvider>
  )
}
