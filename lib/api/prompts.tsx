import { executePrompt } from "@/lib/services/ai-providers"
import { settingsManager } from "@/lib/models/settings"
import { historyManager } from "@/lib/models/history"
import { validatePrompt, validateProvider, validateOutputFormat } from "@/lib/utils/validation"

export interface PromptExecutionResult {
  success: boolean
  output?: string
  error?: string
}

export async function runPrompt(prompt: string, format: string, provider?: string): Promise<PromptExecutionResult> {
  try {
    // Validate inputs
    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.isValid) {
      return { success: false, error: promptValidation.error }
    }

    if (!validateOutputFormat(format)) {
      return { success: false, error: "Invalid output format" }
    }

    // Get settings
    const settings = settingsManager.getSettings()
    const selectedProvider = provider || settings.provider

    if (!validateProvider(selectedProvider)) {
      return { success: false, error: "Invalid provider selected" }
    }

    // Check if user has API key or free prompts available
    if (!settings.apiKey) {
      if (!settingsManager.canUseFreePlan()) {
        return { success: false, error: "Please add API key in Settings." }
      }
      // Use free plan with mock response
      const mockOutput = generateMockResponse(prompt, format)
      settingsManager.updateFreePromptCount()

      // Save to history
      historyManager.saveHistory({
        prompt,
        output: mockOutput,
        format,
        provider: selectedProvider,
        success: true,
      })

      return { success: true, output: mockOutput }
    }

    // Execute with real API
    const output = await executePrompt(selectedProvider, settings.apiKey, prompt, format)

    // Save to history
    historyManager.saveHistory({
      prompt,
      output,
      format,
      provider: selectedProvider,
      success: true,
    })

    return { success: true, output }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    // Save failed attempt to history
    historyManager.saveHistory({
      prompt,
      output: `Error: ${errorMessage}`,
      format,
      provider: provider || settingsManager.getSettings().provider,
      success: false,
    })

    return { success: false, error: errorMessage }
  }
}

function generateMockResponse(prompt: string, format: string): string {
  const responses: Record<string, string> = {
    json: `{"response": "Mock response for: ${prompt.slice(0, 50)}...", "status": "success", "timestamp": "${new Date().toISOString()}"}`,
    xml: `<response><content>Mock response for: ${prompt.slice(0, 50)}...</content><status>success</status><timestamp>${new Date().toISOString()}</timestamp></response>`,
    advanced: `# Advanced Response\n\n**Prompt:** ${prompt.slice(0, 50)}...\n\n**Analysis:** This is a mock response generated for demonstration purposes.\n\n**Recommendations:**\n- Consider upgrading to use real AI providers\n- Add your API key in settings for actual responses`,
    plain: `Mock response for: ${prompt.slice(0, 50)}...\n\nThis is a demonstration response. Add your API key in settings to get real AI-powered responses.`,
  }

  return responses[format] || responses.plain
}
