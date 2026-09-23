const JPEG_QUALITY = 90

/**
 * 現在の表示部分（Visible Tab）のスクリーンショットを撮影する。
 * @returns JPEG形式のdata URL
 */
export async function captureVisibleTab(windowId: number): Promise<string> {
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
    format: "jpeg",
    quality: JPEG_QUALITY
  })
  return dataUrl
}

interface CdpLayoutMetrics {
  cssContentSize?: { width: number; height: number }
  contentSize?: { width: number; height: number }
}

/**
 * chrome.debugger (Chrome DevTools Protocol) を使用して、
 * ページ全体（スクロール部分含む）のスクリーンショットを撮影する。
 * @returns JPEG形式のdata URL
 */
export async function captureFullPage(tabId: number): Promise<string> {
  const target = { tabId }
  await chrome.debugger.attach(target, "1.3")

  try {
    await chrome.debugger.sendCommand(target, "Page.enable")

    const metrics = (await chrome.debugger.sendCommand(
      target,
      "Page.getLayoutMetrics"
    )) as CdpLayoutMetrics

    const size = metrics.cssContentSize ?? metrics.contentSize
    if (!size) {
      throw new Error("ページサイズの取得に失敗しました。")
    }

    const result = (await chrome.debugger.sendCommand(
      target,
      "Page.captureScreenshot",
      {
        format: "jpeg",
        quality: JPEG_QUALITY,
        captureBeyondViewport: true,
        clip: {
          x: 0,
          y: 0,
          width: size.width,
          height: size.height,
          scale: 1
        }
      }
    )) as { data?: string }

    if (!result?.data) {
      throw new Error("スクリーンショットの取得に失敗しました。")
    }

    return `data:image/jpeg;base64,${result.data}`
  } finally {
    await chrome.debugger.detach(target).catch(() => undefined)
  }
}
