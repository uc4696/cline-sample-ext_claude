import { useState } from "react"

import type { CustomSize, DisplayBounds, SizeMode } from "~lib/types"
import { validateSize } from "~lib/resize"

interface CustomSizeManagerProps {
  mode: SizeMode
  display: DisplayBounds
  customSizes: CustomSize[]
  onAdd: (size: CustomSize) => void
  onRemove: (id: string) => void
  onApply: (size: CustomSize) => void
}

export function CustomSizeManager({
  mode,
  display,
  customSizes,
  onAdd,
  onRemove,
  onApply
}: CustomSizeManagerProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [error, setError] = useState<string | null>(null)

  const filtered = customSizes.filter((s) => s.mode === mode)

  function handleAdd() {
    const w = Number(width)
    const h = Number(height)
    const result = validateSize(w, h, display)
    if (!result.valid) {
      setError(result.error ?? "入力値が不正です。")
      return
    }
    const size: CustomSize = {
      id: `custom-${mode}-${Date.now()}`,
      label: label.trim() || `${w}x${h}`,
      width: w,
      height: h,
      mode
    }
    onAdd(size)
    setLabel("")
    setWidth("")
    setHeight("")
    setError(null)
  }

  return (
    <div className="custom-size-manager">
      <button
        type="button"
        className="link-button"
        onClick={() => setOpen((v) => !v)}>
        {open ? "▲ カスタムサイズを閉じる" : "▼ カスタムサイズの追加・削除"}
      </button>

      {open && (
        <div className="custom-size-panel">
          <div className="custom-size-list">
            {filtered.length === 0 && (
              <p className="empty-hint">保存済みのカスタムサイズはありません。</p>
            )}
            {filtered.map((size) => (
              <div className="custom-size-row" key={size.id}>
                <button
                  className="custom-size-apply"
                  onClick={() => onApply(size)}
                  title={`${size.width} x ${size.height}`}>
                  {size.label}
                </button>
                <button
                  className="custom-size-remove"
                  aria-label="削除"
                  onClick={() => onRemove(size.id)}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="custom-size-form">
            <input
              className="text-input"
              placeholder="名前（省略可）"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <div className="wh-row">
              <input
                className="text-input wh-input"
                type="number"
                placeholder="幅"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <span className="wh-sep">×</span>
              <input
                className="text-input wh-input"
                type="number"
                placeholder="高さ"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <p className="hint-text">
              現在のディスプレイ: {display.width} x {display.height}（この範囲内で指定してください）
            </p>
            <button type="button" className="primary-button" onClick={handleAdd}>
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
