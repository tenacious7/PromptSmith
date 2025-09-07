"use client"

import { Button } from "@/components/ui/button"
import { Bot, Home, History, Settings, User } from "lucide-react"

interface NavbarProps {
  onHistoryClick: () => void
  onSettingsClick: () => void
}

export function Navbar({ onHistoryClick, onSettingsClick }: NavbarProps) {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary rounded-lg">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">PromptSmith</h1>
          </div>

          {/* Center Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" className="text-foreground hover:bg-accent">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button variant="ghost" onClick={onHistoryClick} className="text-foreground hover:bg-accent">
              <History className="mr-2 h-4 w-4" />
              History
            </Button>
            <Button variant="ghost" onClick={onSettingsClick} className="text-foreground hover:bg-accent">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>

          {/* Profile */}
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
