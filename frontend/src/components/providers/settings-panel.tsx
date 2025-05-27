"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTheme as useNextTheme } from "next-themes"
import { Check, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ColorTheme {
  name: string
  accent: string
}

const colorThemes: Record<string, ColorTheme> = {
  blue: {
    name: "Blue",
    accent: "bg-blue-500",
  },
  green: {
    name: "Green",
    accent: "bg-green-500",
  },
  purple: {
    name: "Purple",
    accent: "bg-purple-500",
  },
  rose: {
    name: "Rose",
    accent: "bg-rose-500",
  },
  orange: {
    name: "Orange",
    accent: "bg-orange-500",
  },
  slate: {
    name: "Slate",
    accent: "bg-slate-500",
  },
}

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { theme: mode, setTheme: setMode } = useNextTheme()
  const [mounted, setMounted] = useState(false)
  const [currentColorTheme, setCurrentColorTheme] = useState<string>("blue")

  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)

    // Get the initial color theme from localStorage or default to blue
    const savedColorTheme = localStorage.getItem("color-theme") || "blue"
    setCurrentColorTheme(savedColorTheme)

    // Apply the theme class to document body
    applyThemeClass(savedColorTheme)
  }, [])

  // Function to apply theme class to document body
  const applyThemeClass = (themeName: string) => {
    // Remove all existing theme classes
    const themeClasses = Object.keys(colorThemes)
    document.documentElement.classList.remove(...themeClasses)

    // Add the new theme class
    document.documentElement.classList.add(themeName)
  }

  // Handle color theme change
  const handleColorThemeChange = (themeName: string) => {
    setCurrentColorTheme(themeName)
    applyThemeClass(themeName)
    localStorage.setItem("color-theme", themeName)
  }

  // Prevent rendering until mounted
  if (!mounted) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Appearance</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="h-12 justify-start" disabled>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button variant="secondary" className="h-12 justify-start" disabled>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Color Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(colorThemes).map(([key, themeOption]) => (
                  <Button
                    key={key}
                    variant="outline"
                    className="h-12 justify-start"
                    disabled
                  >
                    <div className={`size-4 rounded-full bg-${themeOption.accent} mr-2`} />
                    {themeOption.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6 px-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Appearance</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className={`h-12 justify-start ${mode === "light" ? "ring-2 ring-theme-primary" : ""}`}
                onClick={() => setMode("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
                {mode === "light" && <Check className="ml-auto h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                className={`h-12 justify-start ${mode === "dark" ? "ring-2 ring-theme-primary" : ""}`}
                onClick={() => setMode("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
                {mode === "dark" && <Check className="ml-auto h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Color Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(colorThemes).map(([key, themeOption]) => (
                <Button
                  key={key}
                  variant="outline"
                  className={cn(
                    `h-12 justify-start`,
                    currentColorTheme === key
                      ? `ring-2 ring-theme-primary`
                      : ""
                  )}
                  onClick={() => handleColorThemeChange(key)}
                >
                  <div className={`size-4 rounded-full ${themeOption.accent} mr-2`} />
                  {themeOption.name}
                  {currentColorTheme === key && <Check className="ml-auto h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}