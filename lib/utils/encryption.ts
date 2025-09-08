const ENCRYPTION_KEY = "promptsmith-secure-key-2024"

export function encryptApiKey(apiKey: string): string {
  if (!apiKey) return ""

  // Simple encryption for demo - in production use proper encryption
  const encrypted = btoa(apiKey + ENCRYPTION_KEY)
  return encrypted
}

export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey) return ""

  try {
    const decrypted = atob(encryptedKey)
    return decrypted.replace(ENCRYPTION_KEY, "")
  } catch (error) {
    return ""
  }
}

export function validateApiKey(apiKey: string, provider: string): boolean {
  if (!apiKey) return false

  // Basic validation patterns for different providers
  const patterns: Record<string, RegExp> = {
    openai: /^sk-[a-zA-Z0-9]{48,}$/,
    gemini: /^[a-zA-Z0-9_-]{39}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
    groq: /^gsk_[a-zA-Z0-9]{52}$/,
    together: /^[a-f0-9]{64}$/,
  }

  const pattern = patterns[provider]
  return pattern ? pattern.test(apiKey) : apiKey.length > 10
}
