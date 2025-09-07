"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Check, AlertCircle } from "lucide-react"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [provider, setProvider] = useState("openai")
  const [apiKey, setApiKey] = useState("")
  const [outputFormat, setOutputFormat] = useState("json")
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")

  const handleSave = () => {
    // Save settings logic here
    console.log("Settings saved:", { provider, apiKey, outputFormat })
    onClose()
  }

  const handleTestConnection = async () => {
    setConnectionStatus("testing")

    // Simulate API test
    setTimeout(() => {
      setConnectionStatus(apiKey ? "success" : "error")
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Provider Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">AI Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider" className="text-card-foreground">
                  Provider
                </Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                    <SelectItem value="together">Together AI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-card-foreground">
                  API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={connectionStatus === "testing" || !apiKey}
                  className="border-border text-foreground hover:bg-accent bg-transparent"
                >
                  {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
                </Button>

                {connectionStatus === "success" && (
                  <div className="flex items-center text-green-500 text-sm">
                    <Check className="h-4 w-4 mr-1" />
                    Connected
                  </div>
                )}

                {connectionStatus === "error" && (
                  <div className="flex items-center text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Failed
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output Settings */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground text-lg">Output Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="outputFormat" className="text-card-foreground">
                  Default Format
                </Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="plain">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-accent bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
