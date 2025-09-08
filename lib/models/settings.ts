import { encryptApiKey, decryptApiKey } from "@/lib/utils/encryption"

export interface UserSettings {
  provider: string
  apiKey: string
  outputFormat: string
  freePromptsUsed: number
  maxFreePrompts: number
}

export interface SettingsManager {
  saveSettings: (settings: Partial<UserSettings>) => void
  getSettings: () => UserSettings
  updateFreePromptCount: () => void
  canUseFreePlan: () => boolean
}

class LocalStorageSettingsManager implements SettingsManager {
  private readonly STORAGE_KEY = "promptsmith-settings"
  private readonly DEFAULT_SETTINGS: UserSettings = {
    provider: "openai",
    apiKey: "",
    outputFormat: "json",
    freePromptsUsed: 0,
    maxFreePrompts: 5,
  }

  saveSettings(settings: Partial<UserSettings>): void {
    const currentSettings = this.getSettings()
    const updatedSettings = { ...currentSettings, ...settings }

    // Encrypt API key before storing
    if (settings.apiKey !== undefined) {
      updatedSettings.apiKey = encryptApiKey(settings.apiKey)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings))
  }

  getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return this.DEFAULT_SETTINGS

      const parsed = JSON.parse(stored)
      // Decrypt API key when loading
      if (parsed.apiKey) {
        parsed.apiKey = decryptApiKey(parsed.apiKey)
      }

      return { ...this.DEFAULT_SETTINGS, ...parsed }
    } catch (error) {
      console.error("Error loading settings:", error)
      return this.DEFAULT_SETTINGS
    }
  }

  updateFreePromptCount(): void {
    const settings = this.getSettings()
    this.saveSettings({ freePromptsUsed: settings.freePromptsUsed + 1 })
  }

  canUseFreePlan(): boolean {
    const settings = this.getSettings()
    return settings.freePromptsUsed < settings.maxFreePrompts
  }
}

export const settingsManager = new LocalStorageSettingsManager()
