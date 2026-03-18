const STORAGE_KEY = "dashboard_filters"

export type DashboardFilters = {
  documentCodeFilter: string
  apnFilter: string
  leadQualitySort: string
  recordingDateSort: "latest" | "earliest"
}

export const DEFAULT_FILTERS: DashboardFilters = {
  documentCodeFilter: "all",
  apnFilter: "all",
  leadQualitySort: "none",
  recordingDateSort: "latest",
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export function getSavedFilters(): DashboardFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_FILTERS

    const parsed = JSON.parse(stored)
    
    // Validate and merge with defaults to handle missing/corrupted fields
    return {
      documentCodeFilter:
        typeof parsed.documentCodeFilter === "string"
          ? parsed.documentCodeFilter
          : DEFAULT_FILTERS.documentCodeFilter,
      apnFilter:
        typeof parsed.apnFilter === "string"
          ? parsed.apnFilter
          : DEFAULT_FILTERS.apnFilter,
      leadQualitySort:
        typeof parsed.leadQualitySort === "string"
          ? parsed.leadQualitySort
          : DEFAULT_FILTERS.leadQualitySort,
      recordingDateSort:
        parsed.recordingDateSort === "latest" || parsed.recordingDateSort === "earliest"
          ? parsed.recordingDateSort
          : DEFAULT_FILTERS.recordingDateSort,
    }
  } catch (error) {
    console.warn("[filters-storage] Failed to parse saved filters, using defaults:", error)
    return DEFAULT_FILTERS
  }
}

export function setSavedFilters(filters: DashboardFilters): void {
  if (typeof window === "undefined") return

  // Debounce writes to avoid excessive localStorage operations
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    } catch (error) {
      console.warn("[filters-storage] Failed to save filters:", error)
    }
  }, 100)
}

export function clearSavedFilters(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn("[filters-storage] Failed to clear filters:", error)
  }
}
