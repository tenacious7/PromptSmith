import { type NextRequest, NextResponse } from "next/server"

interface PromptRequest {
  prompt: string
  format: string
}

interface Settings {
  provider: string
  apiKeys: {
    [key: string]: string
  }
}

// AI Provider API calls
async function callOpenAI(prompt: string, apiKey: string, format: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Respond in ${format} format.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function callGemini(prompt: string, apiKey: string, format: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nPlease respond in ${format} format.`,
              },
            ],
          },
        ],
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

async function callAnthropic(prompt: string, apiKey: string, format: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\nPlease respond in ${format} format.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function callGroq(prompt: string, apiKey: string, format: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant. Respond in ${format} format.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, format }: PromptRequest = await request.json()

    console.log("[v0] Received prompt request:", { promptLength: prompt?.length, format })

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get user settings from localStorage (simulated via headers or cookies)
    const settingsHeader = request.headers.get("x-user-settings")
    const settings: Settings = {
      provider: "openai",
      apiKeys: {},
    }

    if (settingsHeader) {
      try {
        const parsedSettings = JSON.parse(settingsHeader)
        if (parsedSettings && typeof parsedSettings === "object") {
          settings.provider = parsedSettings.provider || "openai"
          settings.apiKeys = parsedSettings.apiKeys || {}
        }
        console.log("[v0] Parsed settings:", {
          provider: settings.provider,
          hasApiKeys: Object.keys(settings.apiKeys),
          requestedProvider: settings.provider,
          hasRequestedProviderKey: !!settings.apiKeys[settings.provider],
        })
      } catch (e) {
        console.error("[v0] Failed to parse settings:", e)
      }
    } else {
      console.log("[v0] No settings header found")
    }

    const { provider, apiKeys } = settings
    const apiKey = apiKeys && typeof apiKeys === "object" ? apiKeys[provider] : undefined

    // Check if API key exists for the selected provider
    if (!apiKey) {
      console.log("[v0] No API key found for provider:", provider, "Available keys:", Object.keys(apiKeys || {}))
      return NextResponse.json(
        {
          error: `No API key found for ${provider}. Please add your API key in settings.`,
          requiresApiKey: true,
        },
        { status: 400 },
      )
    }

    let output: string

    // Call the appropriate AI provider
    try {
      console.log("[v0] Calling AI provider:", provider)
      switch (provider) {
        case "openai":
          output = await callOpenAI(prompt, apiKey, format)
          break
        case "gemini":
          output = await callGemini(prompt, apiKey, format)
          break
        case "anthropic":
          output = await callAnthropic(prompt, apiKey, format)
          break
        case "groq":
          output = await callGroq(prompt, apiKey, format)
          break
        default:
          // Fallback to mock response for unsupported providers
          output = `Mock response for ${provider}: Enhanced version of your prompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}"`
      }
      console.log("[v0] AI provider response received, length:", output?.length)
    } catch (error) {
      console.error(`[v0] ${provider} API error:`, error)
      return NextResponse.json(
        {
          error: `Failed to get response from ${provider}. Please check your API key.`,
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      output,
      provider,
      format,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Prompt execution error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
