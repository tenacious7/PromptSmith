export interface PromptHistory {
  id: string
  prompt: string
  output: string
  timestamp: Date
  format: string
  provider: string
  success: boolean
}

export interface HistoryManager {
  saveHistory: (item: Omit<PromptHistory, "id" | "timestamp">) => void
  getHistory: () => PromptHistory[]
  deleteHistory: (id: string) => void
  clearHistory: () => void
}

class LocalStorageHistoryManager implements HistoryManager {
  private readonly STORAGE_KEY = "promptsmith-history"
  private readonly MAX_HISTORY_ITEMS = 100

  saveHistory(item: Omit<PromptHistory, "id" | "timestamp">): void {
    const history = this.getHistory()
    const newItem: PromptHistory = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    const updatedHistory = [newItem, ...history].slice(0, this.MAX_HISTORY_ITEMS)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory))
  }

  getHistory(): PromptHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      return parsed.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))
    } catch (error) {
      console.error("Error loading history:", error)
      return []
    }
  }

  deleteHistory(id: string): void {
    const history = this.getHistory()
    const filtered = history.filter((item) => item.id !== id)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered))
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

export const historyManager = new LocalStorageHistoryManager()
