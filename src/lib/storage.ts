import { Storage } from "@plasmohq/storage"

import { DEFAULT_SETTINGS, STORAGE_KEYS } from "./constants"
import type { CustomSize } from "./types"

export interface Settings {
  captureDirName: string
  storageArea: "local" | "sync"
}

/**
 * 設定（Captureフォルダ名、storageAreaの選択そのもの）は常に local に保存する。
 * これにより「sync を選んだ」という設定自体は端末ローカルに固定され、
 * 実際のデータ（カスタムサイズ）だけを選択された area に保存できる。
 */
const settingsStorage = new Storage({ area: "local" })

/** カスタムサイズ保存用。area は動的に切り替える。 */
let dataStorage = new Storage({ area: DEFAULT_SETTINGS.storageArea })
let currentArea: "local" | "sync" = DEFAULT_SETTINGS.storageArea

function getDataStorage(area: "local" | "sync") {
  if (area !== currentArea) {
    currentArea = area
    dataStorage = new Storage({ area })
  }
  return dataStorage
}

export async function getSettings(): Promise<Settings> {
  const raw = await settingsStorage.get<Settings>(STORAGE_KEYS.settings)
  return {
    captureDirName: raw?.captureDirName || DEFAULT_SETTINGS.captureDirName,
    storageArea: raw?.storageArea || DEFAULT_SETTINGS.storageArea
  }
}

export async function setSettings(settings: Settings): Promise<void> {
  await settingsStorage.set(STORAGE_KEYS.settings, settings)
}

export async function getCustomSizes(): Promise<CustomSize[]> {
  const settings = await getSettings()
  const storage = getDataStorage(settings.storageArea)
  const list = await storage.get<CustomSize[]>(STORAGE_KEYS.customSizes)
  return list || []
}

export async function saveCustomSizes(list: CustomSize[]): Promise<void> {
  const settings = await getSettings()
  const storage = getDataStorage(settings.storageArea)
  await storage.set(STORAGE_KEYS.customSizes, list)
}

export async function addCustomSize(size: CustomSize): Promise<CustomSize[]> {
  const list = await getCustomSizes()
  const next = [...list.filter((s) => s.id !== size.id), size]
  await saveCustomSizes(next)
  return next
}

export async function removeCustomSize(id: string): Promise<CustomSize[]> {
  const list = await getCustomSizes()
  const next = list.filter((s) => s.id !== id)
  await saveCustomSizes(next)
  return next
}

/**
 * storageArea 切り替え時、既存のカスタムサイズを新しい area にも複製する
 * （データの引っ越し）。設定自体は常に local に保存されるため、
 * この関数呼び出し前後で getSettings() の値は呼び出し側で更新すること。
 */
export async function migrateCustomSizes(
  fromArea: "local" | "sync",
  toArea: "local" | "sync"
): Promise<void> {
  if (fromArea === toArea) return
  const fromStorage = getDataStorage(fromArea)
  const list = await fromStorage.get<CustomSize[]>(STORAGE_KEYS.customSizes)
  if (list && list.length > 0) {
    const toStorage = getDataStorage(toArea)
    await toStorage.set(STORAGE_KEYS.customSizes, list)
  }
}
