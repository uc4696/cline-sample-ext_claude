import { MAX_SIZE_FALLBACK, MIN_SIZE } from "./constants"
import type { DisplayBounds, ValidationResult } from "./types"

/**
 * 現在のディスプレイ（アクティブウィンドウが乗っているディスプレイ）の
 * 解像度を取得する。取得できない場合はフォールバック値を返す。
 */
export async function getCurrentDisplayBounds(): Promise<DisplayBounds> {
  try {
    const displays = await chrome.system.display.getInfo()
    const currentWindow = await chrome.windows.getCurrent()
    const winLeft = currentWindow.left ?? 0
    const winTop = currentWindow.top ?? 0

    const match =
      displays.find((d) => {
        const b = d.bounds
        return (
          winLeft >= b.left &&
          winLeft < b.left + b.width &&
          winTop >= b.top &&
          winTop < b.top + b.height
        )
      }) ||
      displays.find((d) => d.isPrimary) ||
      displays[0]

    if (match) {
      return { width: match.bounds.width, height: match.bounds.height }
    }
  } catch (e) {
    // chrome.system.display が使用できない環境向けフォールバック
  }
  return { width: MAX_SIZE_FALLBACK, height: MAX_SIZE_FALLBACK }
}

/**
 * カスタムサイズ入力のバリデーション。
 * 現在のディスプレイ解像度を基準に、現実的な最大値・最小値をチェックする。
 */
export function validateSize(
  width: number,
  height: number,
  display: DisplayBounds
): ValidationResult {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return { valid: false, error: "幅と高さには数値を入力してください。" }
  }
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    return { valid: false, error: "幅と高さは整数で入力してください。" }
  }
  if (width < MIN_SIZE || height < MIN_SIZE) {
    return {
      valid: false,
      error: `幅・高さは ${MIN_SIZE}px 以上で指定してください。`
    }
  }
  if (width > display.width || height > display.height) {
    return {
      valid: false,
      error: `幅・高さは現在のディスプレイ解像度 (${display.width}x${display.height}) 以下で指定してください。`
    }
  }
  return { valid: true }
}

/**
 * ウィンドウ全体のサイズ（ブラウザのUI枠含む）を指定サイズに変更する。
 */
export async function resizeWindow(width: number, height: number) {
  const win = await chrome.windows.getCurrent()
  if (win.id === undefined) return
  await chrome.windows.update(win.id, {
    width: Math.round(width),
    height: Math.round(height),
    state: "normal"
  })
}

/**
 * ビューポート（コンテンツ表示領域）のサイズを指定サイズに変更する。
 * ウィンドウ全体サイズとビューポートサイズの差分（ブラウザUI枠）を測定し、
 * その差分を加算したウィンドウサイズに変更することでビューポートサイズを合わせる。
 */
export async function resizeViewport(width: number, height: number) {
  const win = await chrome.windows.getCurrent()
  if (win.id === undefined || win.width === undefined || win.height === undefined) {
    return
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return

  const [{ result: currentViewport }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      width: window.innerWidth,
      height: window.innerHeight
    })
  })

  if (!currentViewport) return

  const diffWidth = win.width - currentViewport.width
  const diffHeight = win.height - currentViewport.height

  await chrome.windows.update(win.id, {
    width: Math.round(width + diffWidth),
    height: Math.round(height + diffHeight),
    state: "normal"
  })
}

/** 現在のウィンドウサイズを取得する */
export async function getCurrentWindowSize(): Promise<DisplayBounds> {
  const win = await chrome.windows.getCurrent()
  return { width: win.width ?? 0, height: win.height ?? 0 }
}

/** 現在のアクティブタブのビューポートサイズを取得する */
export async function getCurrentViewportSize(): Promise<DisplayBounds> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) return { width: 0, height: 0 }
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({ width: window.innerWidth, height: window.innerHeight })
    })
    return result ?? { width: 0, height: 0 }
  } catch {
    return { width: 0, height: 0 }
  }
}
