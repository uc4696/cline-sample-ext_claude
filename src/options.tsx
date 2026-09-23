import { useEffect, useState } from "react"

import { DEFAULT_SETTINGS } from "~lib/constants"
import { getSettings, migrateCustomSizes, setSettings, type Settings } from "~lib/storage"

import "./options.css"

function IndexOptions() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSettings().then((s) => {
      setSettingsState(s)
      setLoading(false)
    })
  }, [])

  async function handleSave(next: Settings) {
    setSaved(false)
    const prevArea = settings.storageArea
    await setSettings(next)
    if (prevArea !== next.storageArea) {
      await migrateCustomSizes(prevArea, next.storageArea)
    }
    setSettingsState(next)
    setSaved(true)
  }

  if (loading) {
    return (
      <main className="options-root">
        <p>読み込み中...</p>
      </main>
    )
  }

  return (
    <main className="options-root">
      <h1 className="options-title">Window &amp; Viewport Resizer - 設定</h1>

      <section className="options-section">
        <label className="options-label" htmlFor="captureDirName">
          スクリーンショット保存先フォルダ名
        </label>
        <p className="options-hint">
          ダウンロードフォルダ配下に作成されるフォルダ名です（例: Downloads/Captures/...）。
        </p>
        <input
          id="captureDirName"
          className="options-input"
          type="text"
          value={settings.captureDirName}
          onChange={(e) =>
            setSettingsState({ ...settings, captureDirName: e.target.value })
          }
        />
      </section>

      <section className="options-section">
        <label className="options-label">ストレージ領域（カスタムサイズの保存先）</label>
        <p className="options-hint">
          local: この端末のみに保存されます。sync: Googleアカウントに紐づき、他端末とも同期されます。
        </p>
        <div className="options-radio-group">
          <label className="options-radio">
            <input
              type="radio"
              name="storageArea"
              value="local"
              checked={settings.storageArea === "local"}
              onChange={() => setSettingsState({ ...settings, storageArea: "local" })}
            />
            local（既定）
          </label>
          <label className="options-radio">
            <input
              type="radio"
              name="storageArea"
              value="sync"
              checked={settings.storageArea === "sync"}
              onChange={() => setSettingsState({ ...settings, storageArea: "sync" })}
            />
            sync
          </label>
        </div>
      </section>

      <button className="options-save-button" onClick={() => handleSave(settings)}>
        保存
      </button>

      {saved && <p className="options-saved-text">設定を保存しました。</p>}
    </main>
  )
}

export default IndexOptions
