export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  if (!prompt || prompt.trim().length === 0) {
    return { isValid: false, error: "Prompt cannot be empty" }
  }

  if (prompt.length > 4000) {
    return { isValid: false, error: "Prompt is too long (max 4000 characters)" }
  }

  return { isValid: true }
}

export function validateProvider(provider: string): boolean {
  const validProviders = ["openai", "gemini", "anthropic", "groq", "together"]
  return validProviders.includes(provider)
}

export function validateOutputFormat(format: string): boolean {
  const validFormats = ["xml", "json", "advanced", "plain"]
  return validFormats.includes(format)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}
