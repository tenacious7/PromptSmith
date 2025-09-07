"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Clock, Copy } from "lucide-react"

interface PromptHistory {
  id: string
  prompt: string
  output: string
  timestamp: Date
  format: string
}

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  history: PromptHistory[]
  onLoadHistory: (item: PromptHistory) => void
}

export function HistoryPanel({ isOpen, onClose, history, onLoadHistory }: HistoryPanelProps) {
  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] bg-background border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Prompt History</span>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {history.map((item) => (
            <Card
              key={item.id}
              className="border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onLoadHistory(item)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-card-foreground truncate">{item.prompt}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleCopy(item.prompt, e)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.timestamp.toLocaleString()} • {item.format.toUpperCase()}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-muted p-2 rounded text-xs font-mono text-foreground truncate">{item.output}</div>
              </CardContent>
            </Card>
          ))}

          {history.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No prompts in history yet</p>
              <p className="text-sm">Run your first prompt to see it here</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
