export type SizeMode = "window" | "viewport"

export interface SizePreset {
  id: string
  label: string
  width: number
  height: number
}

export interface CustomSize extends SizePreset {
  mode: SizeMode
}

export interface DisplayBounds {
  width: number
  height: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
}
