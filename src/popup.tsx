import { useEffect, useState } from "react"

import { CustomSizeManager } from "~components/CustomSizeManager"
import { PresetGrid } from "~components/PresetGrid"
import { VIEWPORT_PRESETS, WINDOW_PRESETS } from "~lib/constants"
import type { CaptureMode, CaptureResponse } from "~lib/messages"
import {
  getCurrentDisplayBounds,
  getCurrentViewportSize,
  getCurrentWindowSize,
  resizeViewport,
  resizeWindow
} from "~lib/resize"
import { addCustomSize, getCustomSizes, removeCustomSize } from "~lib/storage"
import type { CustomSize, DisplayBounds, SizeMode, SizePreset } from "~lib/types"

import "./style.css"

function IndexPopup() {
  const [mode, setMode] = useState<SizeMode>("window")
  const [windowSize, setWindowSize] = useState<DisplayBounds>({ width: 0, height: 0 })
  const [viewportSize, setViewportSize] = useState<DisplayBounds>({ width: 0, height: 0 })
  const [display, setDisplay] = useState<DisplayBounds>({ width: 0, height: 0 })
  const [customSizes, setCustomSizes] = useState<CustomSize[]>([])
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function refreshSizes() {
    const [w, v] = await Promise.all([getCurrentWindowSize(), getCurrentViewportSize()])
    setWindowSize(w)
    setViewportSize(v)
  }

  useEffect(() => {
    refreshSizes()
    getCurrentDisplayBounds().then(setDisplay)
    getCustomSizes().then(setCustomSizes)
  }, [])

  async function applySize(preset: SizePreset) {
    setBusy(true)
    setStatus(null)
    try {
      if (mode === "window") {
        await resizeWindow(preset.width, preset.height)
      } else {
        await resizeViewport(preset.width, preset.height)
      }
      await refreshSizes()
      setStatus(`サイズを ${preset.width} x ${preset.height} に変更しました。`)
    } catch (e) {
      setStatus(`エラー: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  async function handleAddCustomSize(size: CustomSize) {
    const list = await addCustomSize(size)
    setCustomSizes(list)
  }

  async function handleRemoveCustomSize(id: string) {
    const list = await removeCustomSize(id)
    setCustomSizes(list)
  }

  async function handleCapture(captureMode: CaptureMode) {
    setBusy(true)
    setStatus(captureMode === "full-page" ? "ページ全体を撮影中..." : "撮影中...")
    try {
      const response: CaptureResponse = await chrome.runtime.sendMessage({
        type: "capture-screenshot",
        mode: captureMode
      })
      if (response?.ok) {
        setStatus(`保存しました: ${response.filename}`)
      } else {
        setStatus(`エラー: ${response?.error ?? "撮影に失敗しました。"}`)
      }
    } catch (e) {
      setStatus(`エラー: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBusy(false)
    }
  }

  const presets = mode === "window" ? WINDOW_PRESETS : VIEWPORT_PRESETS

  return (
    <main className="popup-root">
      <h1 className="popup-title">Window &amp; Viewport Resizer</h1>

      <section className="current-size-section">
        <div className="size-row">
          <span className="size-label">ウィンドウ:</span>
          <span className="size-value">
            {windowSize.width} x {windowSize.height}
          </span>
        </div>
        <div className="size-row">
          <span className="size-label">ビューポート:</span>
          <span className="size-value">
            {viewportSize.width} x {viewportSize.height}
          </span>
        </div>
      </section>

      <div className="mode-toggle">
        <button
          className={`mode-button ${mode === "window" ? "active" : ""}`}
          onClick={() => setMode("window")}>
          ウィンドウ基準
        </button>
        <button
          className={`mode-button ${mode === "viewport" ? "active" : ""}`}
          onClick={() => setMode("viewport")}>
          ビューポート基準
        </button>
      </div>

      <PresetGrid presets={presets} onSelect={applySize} disabled={busy} />

      <CustomSizeManager
        mode={mode}
        display={display}
        customSizes={customSizes}
        onAdd={handleAddCustomSize}
        onRemove={handleRemoveCustomSize}
        onApply={applySize}
      />

      <section className="capture-section">
        <p className="section-title">スクリーンショット</p>
        <div className="capture-buttons">
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => handleCapture("visible")}>
            表示部分を撮影
          </button>
          <button
            className="secondary-button"
            disabled={busy}
            onClick={() => handleCapture("full-page")}>
            ページ全体を撮影
          </button>
        </div>
      </section>

      {status && <p className="status-text">{status}</p>}

      <button className="options-link" onClick={() => chrome.runtime.openOptionsPage()}>
        ⚙ 設定を開く
      </button>
    </main>
  )
}

export default IndexPopup
