import type { SizePreset } from "./types"

/**
 * デフォルトテンプレート（ビューポートサイズ基準）。
 * 一般的なデバイスのビューポートサイズを採用。
 */
export const VIEWPORT_PRESETS: SizePreset[] = [
  { id: "mobile-portrait", label: "スマホ縦 (375x667)", width: 375, height: 667 },
  { id: "mobile-landscape", label: "スマホ横 (667x375)", width: 667, height: 375 },
  { id: "tablet", label: "タブレット (768x1024)", width: 768, height: 1024 },
  { id: "desktop", label: "PC標準 (1366x768)", width: 1366, height: 768 },
  { id: "desktop-fhd", label: "PC Full HD (1920x1080)", width: 1920, height: 1080 }
]

/**
 * デフォルトテンプレート（ウィンドウサイズ基準）。
 * ビューポートよりも少し大きい値（ブラウザのUI分を加算した目安値）を採用。
 */
export const WINDOW_PRESETS: SizePreset[] = [
  { id: "mobile-portrait", label: "スマホ縦 (390x740)", width: 390, height: 740 },
  { id: "mobile-landscape", label: "スマホ横 (700x420)", width: 700, height: 420 },
  { id: "tablet", label: "タブレット (800x1100)", width: 800, height: 1100 },
  { id: "desktop", label: "PC標準 (1400x850)", width: 1400, height: 850 },
  { id: "desktop-fhd", label: "PC Full HD (1936x1096)", width: 1936, height: 1096 }
]

/** カスタムサイズの現実的な最小値・最大値（px） */
export const MIN_SIZE = 200
export const MAX_SIZE_FALLBACK = 4096

/** ストレージキー */
export const STORAGE_KEYS = {
  customSizes: "custom-sizes",
  settings: "settings"
} as const

/** 既定の設定値 */
export const DEFAULT_SETTINGS = {
  captureDirName: "Captures",
  storageArea: "local" as "local" | "sync"
}
