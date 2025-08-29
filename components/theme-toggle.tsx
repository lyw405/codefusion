"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:outline-none border-none !outline-none !ring-0 !ring-offset-0 active:outline-none data-[state=open]:outline-none"
      >
        <div className="h-[1.1rem] w-[1.1rem] bg-muted-foreground/20 rounded animate-pulse" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg hover:bg-muted/80 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:outline-none border-none !outline-none !ring-0 !ring-offset-0 active:outline-none data-[state=open]:outline-none"
        >
          {theme === "dark" ? (
            <Moon className="h-[1.1rem] w-[1.1rem] transition-all duration-300" />
          ) : (
            <Sun className="h-[1.1rem] w-[1.1rem] transition-all duration-300" />
          )}
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4 mr-2" />
          浅色模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4 mr-2" />
          深色模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <div className="h-4 w-4 mr-2 flex items-center justify-center">
            <div className="w-3 h-3 border-2 border-current rounded-sm" />
          </div>
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}