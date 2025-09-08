interface AIProvider {
  name: string
  apiUrl: string
  headers: (apiKey: string) => Record<string, string>
  formatRequest: (prompt: string, format: string) => any
  formatResponse: (response: any, format: string) => string
}

const providers: Record<string, AIProvider> = {
  openai: {
    name: "OpenAI",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatRequest: (prompt: string, format: string) => ({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `${prompt}\n\nPlease respond in ${format.toUpperCase()} format.` }],
      max_tokens: 1000,
    }),
    formatResponse: (response: any, format: string) => {
      return response.choices?.[0]?.message?.content || "No response received"
    },
  },
  gemini: {
    name: "Google Gemini",
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    headers: (apiKey: string) => ({
      "Content-Type": "application/json",
    }),
    formatRequest: (prompt: string, format: string) => ({
      contents: [
        {
          parts: [{ text: `${prompt}\n\nPlease respond in ${format.toUpperCase()} format.` }],
        },
      ],
    }),
    formatResponse: (response: any, format: string) => {
      return response.candidates?.[0]?.content?.parts?.[0]?.text || "No response received"
    },
  },
  anthropic: {
    name: "Anthropic Claude",
    apiUrl: "https://api.anthropic.com/v1/messages",
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    }),
    formatRequest: (prompt: string, format: string) => ({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{ role: "user", content: `${prompt}\n\nPlease respond in ${format.toUpperCase()} format.` }],
    }),
    formatResponse: (response: any, format: string) => {
      return response.content?.[0]?.text || "No response received"
    },
  },
  groq: {
    name: "Groq",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatRequest: (prompt: string, format: string) => ({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: `${prompt}\n\nPlease respond in ${format.toUpperCase()} format.` }],
      max_tokens: 1000,
    }),
    formatResponse: (response: any, format: string) => {
      return response.choices?.[0]?.message?.content || "No response received"
    },
  },
  together: {
    name: "Together AI",
    apiUrl: "https://api.together.xyz/v1/chat/completions",
    headers: (apiKey: string) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
    formatRequest: (prompt: string, format: string) => ({
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      messages: [{ role: "user", content: `${prompt}\n\nPlease respond in ${format.toUpperCase()} format.` }],
      max_tokens: 1000,
    }),
    formatResponse: (response: any, format: string) => {
      return response.choices?.[0]?.message?.content || "No response received"
    },
  },
}

export async function executePrompt(provider: string, apiKey: string, prompt: string, format: string): Promise<string> {
  const providerConfig = providers[provider]
  if (!providerConfig) {
    throw new Error(`Unsupported provider: ${provider}`)
  }

  if (!apiKey) {
    throw new Error("API key is required")
  }

  try {
    const url = provider === "gemini" ? `${providerConfig.apiUrl}?key=${apiKey}` : providerConfig.apiUrl
    const response = await fetch(url, {
      method: "POST",
      headers: providerConfig.headers(apiKey),
      body: JSON.stringify(providerConfig.formatRequest(prompt, format)),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key")
      }
      throw new Error(`Provider API error: ${response.statusText}`)
    }

    const data = await response.json()
    return providerConfig.formatResponse(data, format)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("Provider not responding, try again")
  }
}

export async function testProviderConnection(provider: string, apiKey: string): Promise<boolean> {
  try {
    await executePrompt(provider, apiKey, "Test connection", "plain")
    return true
  } catch (error) {
    return false
  }
}

export function getProviderName(provider: string): string {
  return providers[provider]?.name || provider
}
