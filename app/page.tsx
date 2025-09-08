"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bot, Play, RotateCcw, Clock, ChevronRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { HistoryPanel } from "@/components/history-panel"
import { SettingsModal } from "@/components/settings-modal"
import { Copy } from "@/components/copy-animation"

interface PromptHistory {
  id: string
  prompt: string
  output: string
  timestamp: Date
  format: string
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState("")
  const [output, setOutput] = useState("")
  const [activeTab, setActiveTab] = useState("json")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<PromptHistory[]>([
    {
      id: "1",
      prompt: "Create a user authentication system",
      output: '{"authentication": {"methods": ["email", "oauth"], "security": "bcrypt"}}',
      timestamp: new Date(Date.now() - 3600000),
      format: "json",
    },
    {
      id: "2",
      prompt: "Design a responsive navbar component",
      output: '<nav className="flex items-center justify-between p-4">...</nav>',
      timestamp: new Date(Date.now() - 7200000),
      format: "xml",
    },
  ])

  const handleRun = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const savedSettings = localStorage.getItem("promptsmith-settings")
      let settings = {
        provider: "openai",
        apiKeys: {},
      }

      if (savedSettings) {
        try {
          settings = JSON.parse(savedSettings)
          if (!settings.apiKeys || typeof settings.apiKeys !== "object") {
            settings.apiKeys = {}
          }
        } catch (e) {
          console.error("[v0] Failed to parse saved settings:", e)
          settings = {
            provider: "openai",
            apiKeys: {},
          }
        }
      }

      console.log("[v0] Sending request with settings:", {
        provider: settings.provider,
        hasApiKey: !!settings.apiKeys[settings.provider],
        availableKeys: Object.keys(settings.apiKeys),
      })

      const response = await fetch("/api/prompts/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-settings": JSON.stringify(settings),
        },
        body: JSON.stringify({
          prompt,
          format: activeTab,
        }),
      })

      const data = await response.json()
      console.log("[v0] API response:", { ok: response.ok, status: response.status, data })

      if (!response.ok) {
        if (data.requiresApiKey) {
          setOutput(`Error: ${data.error}\n\nPlease go to Settings and add your API key for ${settings.provider}.`)
        } else {
          setOutput(
            `Error: ${data.error || "Failed to execute prompt"}${data.details ? `\n\nDetails: ${data.details}` : ""}`,
          )
        }
        return
      }

      setOutput(data.output)

      const newHistoryItem: PromptHistory = {
        id: Date.now().toString(),
        prompt,
        output: data.output,
        timestamp: new Date(),
        format: activeTab,
      }
      setHistory((prev) => [newHistoryItem, ...prev])
    } catch (error) {
      console.error("[v0] Error executing prompt:", error)
      setOutput("Error: Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setPrompt("")
    setOutput("")
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const loadFromHistory = (item: PromptHistory) => {
    setPrompt(item.prompt)
    setOutput(item.output)
    setActiveTab(item.format)
    setIsHistoryOpen(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onHistoryClick={() => setIsHistoryOpen(true)} onSettingsClick={() => setIsSettingsOpen(true)} />

      <div className="container mx-auto p-6 space-y-6">
        {/* Usage Widget */}
        <div className="flex justify-end">
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-muted text-muted-foreground">
              Free Prompts Left: 3/5
            </Badge>
            <Badge variant="outline" className="border-primary text-primary">
              Current Provider: OpenAI
            </Badge>
          </div>
        </div>

        {/* Main Prompt Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Prompt Input</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] bg-input border-border text-foreground placeholder:text-muted-foreground resize-none"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRun}
                    disabled={isLoading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isLoading ? "Running..." : "Run"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(prompt)}
                    className="border-border text-foreground hover:bg-accent"
                  >
                    <Copy className="mr-2 h-4 w-4" width={16} height={16} stroke="hsl(var(--foreground))" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-card-foreground">Output</CardTitle>
                <Copy width={20} height={20} stroke="hsl(var(--foreground))" onClick={() => handleCopy(output)} />
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-muted">
                    <TabsTrigger
                      value="xml"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      XML
                    </TabsTrigger>
                    <TabsTrigger
                      value="json"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      JSON
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Advanced
                    </TabsTrigger>
                    <TabsTrigger
                      value="plain"
                      className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                    >
                      Plain
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="xml" className="mt-4">
                    <div className="bg-muted p-4 rounded-lg min-h-[200px] font-mono text-sm text-foreground">
                      {output || "Output will appear here..."}
                    </div>
                  </TabsContent>
                  <TabsContent value="json" className="mt-4">
                    <div className="bg-muted p-4 rounded-lg min-h-[200px] font-mono text-sm text-foreground">
                      {output || "Output will appear here..."}
                    </div>
                  </TabsContent>
                  <TabsContent value="advanced" className="mt-4">
                    <div className="bg-muted p-4 rounded-lg min-h-[200px] font-mono text-sm text-foreground">
                      {output || "Output will appear here..."}
                    </div>
                  </TabsContent>
                  <TabsContent value="plain" className="mt-4">
                    <div className="bg-muted p-4 rounded-lg min-h-[200px] text-sm text-foreground">
                      {output || "Output will appear here..."}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Quick History Preview */}
          <div className="space-y-4">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Recent</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsHistoryOpen(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    View All
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <p className="text-sm text-foreground truncate">{item.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.timestamp.toLocaleTimeString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadHistory={loadFromHistory}
      />

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
