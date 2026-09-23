# Window & Viewport Resizer (Chrome拡張機能)

ウィンドウサイズ／ビューポートサイズを指定テンプレートやカスタムサイズにリサイズし、表示部分・ページ全体のスクリーンショットを撮影してダウンロードできるChrome拡張機能（Manifest V3 / Plasmoフレームワーク）です。

## 概要

- ウィンドウサイズ・ビューポートサイズの両方に対応したリサイズ機能
- デフォルトテンプレート（スマホ縦/横、タブレット、PC標準 等）＋カスタムサイズの保存
- アイコンクリックで開くポップアップUI（ダークモード自動対応）
- 表示部分（Visible Tab）／ページ全体（Full Page）のスクリーンショット撮影
- `Captures` フォルダ（ダウンロード配下、名称変更可）へJPG形式で保存
- `@plasmohq/storage` によるローカル/同期ストレージの切り替え設定

## 技術スタック

- [Plasmo](https://www.plasmo.com/) (Chrome Extension Framework)
- TypeScript / React
- `@plasmohq/storage`
- Chrome Extension Manifest V3

## ディレクトリ構成（現状）

Plasmoの「[src directory](https://docs.plasmo.com/framework/customization/src)」機能を使用しており、`tsconfig.json` で `~*` を `./src/*` にマッピングしています。これにより **Plasmoのエントリファイル（`popup.tsx` / `options.tsx` / `background.ts` 等）はすべて `src/` 配下に置く必要があります**（`assets/` はプロジェクトルートのまま）。

```
.
├── assets/
│   ├── icon.svg                    # 仮アイコン（SVG、デザイン原本）
│   └── icon.png                    # Plasmoが要求するPNGアイコン（icon.svgから生成、512x512）
├── scripts/
│   └── generate-icon.js            # icon.svg -> icon.png を生成するNode.jsスクリプト（sharpを使用）
├── src/
│   ├── popup.tsx                    # ポップアップ本体（テンプレート選択・カスタムサイズ・スクショボタン）
│   ├── style.css                    # ポップアップ用スタイル（ダークモード対応）
│   ├── options.tsx                  # 設定画面（Optionsページ）本体
│   ├── options.css                  # 設定画面用スタイル（ダークモード対応）
│   ├── background.ts                # スクリーンショット撮影・ダウンロード処理（Service Worker）
│   ├── components/
│   │   ├── PresetGrid.tsx           # テンプレートサイズ選択ボタン群
│   │   └── CustomSizeManager.tsx    # カスタムサイズの追加・削除・適用UI
│   └── lib/
│       ├── types.ts                 # 型定義（SizeMode, SizePreset, CustomSize等）
│       ├── constants.ts             # デフォルトテンプレート・ストレージキー等の定数
│       ├── storage.ts                # @plasmohq/storage を用いたlocal/sync切り替え可能な設定・データ管理
│       ├── resize.ts                 # ウィンドウ／ビューポートのリサイズ・ディスプレイ基準バリデーション
│       ├── screenshot.ts             # Visible Tab / Full Page（chrome.debugger CDP）のスクリーンショット撮影
│       ├── filename.ts               # 保存ファイル名・保存パスの組み立て
│       └── messages.ts               # popup <-> background 間のメッセージ型定義
├── package.json                     # 依存関係・manifest設定（permissions等）
├── tsconfig.json                    # TypeScript設定（~* -> ./src/* のエイリアス設定含む）
├── .gitignore
├── .prettierrc
└── README.md
```

## インストール手順

1. Node.js（推奨: 最新LTS以降）がインストールされていることを確認してください。
2. 依存関係をインストールします（PowerShell）。

   ```powershell
   npm install
   ```

3. （Windows環境で npm 11 以降を使用している場合の注意）
   npm 11 以降は、`lmdb` / `@parcel/watcher` / `@swc/core` / `esbuild` / `msgpackr-extract` / `sharp` などのネイティブモジュールのインストールスクリプト（node-gyp rebuild等）をデフォルトでブロックします。これらがブロックされたままだと `plasmo build` 実行時に `ERROR | Bindings not found.` が発生します。
   `npm install` 実行後、以下を実行してネイティブバインディングを確実に生成してください。

   ```powershell
   npm rebuild
   ```

   （`npm install` を再実行した場合も同様にブロックされる場合があるため、そのたびに `npm rebuild` を実行してください。）

## ビルド・開発手順

- 開発サーバーの起動（ホットリロード付き）:

  ```powershell
  npm run dev
  ```

  起動後、`build/chrome-mv3-dev` フォルダが生成されます。Chromeの `chrome://extensions` で「デベロッパーモード」を有効にし、「パッケージ化されていない拡張機能を読み込む」から `build/chrome-mv3-dev` を選択してください。

- 本番ビルド:

  ```powershell
  npm run build
  ```

  `build/chrome-mv3-prod` フォルダが生成されます。

- 配布用パッケージ（zip）の作成:

  ```powershell
  npm run package
  ```

## 現在の実装状況（進捗）

### ステップ1: プロジェクト初期化（完了）

- `package.json` を手動作成し、以下を設定
  - 依存関係: `plasmo`, `react`, `react-dom`, `@plasmohq/storage`
  - 開発依存: `@types/chrome`, `@types/node`, `@types/react`, `@types/react-dom`, `typescript`, `prettier`, `svgo`
  - `manifest.permissions`: `tabs`, `activeTab`, `storage`, `downloads`, `scripting`, `debugger`
  - `manifest.host_permissions`: `<all_urls>`（フルページスクリーンショットや任意タブへのリサイズ操作に必要）
  - `manifest.action` はあえて指定しない（Plasmoが `popup.tsx` を自動検出して `action.default_popup` / `default_icon` を自動生成するため。手動で `action` を指定すると自動マージされず上書きされてしまうことを確認済み）
- `tsconfig.json`（Plasmo標準構成）を作成
- 最低限のReactボイラープレート `popup.tsx` / `style.css` を作成（現在のウィンドウサイズを表示するだけの仮実装）
- 仮アイコン `assets/icon.svg`（ウィンドウリサイズをイメージした矢印デザイン）を作成し、`scripts/generate-icon.js`（sharp使用）で `assets/icon.png`（512x512）を生成・配置
- `.gitignore` / `.prettierrc` を作成
- `npm install` を実行し依存関係を解決
- `npm run build` を実行し、`build/chrome-mv3-prod` に `manifest.json` / `popup.html` / `popup.*.js` / `popup.*.css` / アイコン一式が正しく生成されることを確認（動作確認済み）

### ステップ2〜6: 本体機能の実装（完了）

`package.json` の `version` を `0.2.0` に更新し、以下をまとめて実装しました。

- **Plasmoの `src` ディレクトリ構成へ移行**
  - `tsconfig.json` の `~*` -> `./src/*` エイリアスに合わせ、`popup.tsx` / `options.tsx` / `background.ts` などのエントリファイルをすべて `src/` 配下に移動（`assets/` はルートのまま）。移動前は `popup.tsx` がルート直下にあったため Plasmo がエントリファイルを認識できず、空の拡張機能になる不具合を確認・修正しました。

- **ステップ2: ポップアップUI（`src/popup.tsx`, `src/components/*`）**
  - 現在のウィンドウサイズ・ビューポートサイズをポップアップを開いた時点でリアルタイム表示
  - 「ウィンドウ基準」「ビューポート基準」の切り替えタブ
  - デフォルトテンプレート5種（スマホ縦/横・タブレット・PC標準・PC Full HD）を `PresetGrid` コンポーネントでボタン表示
  - `CustomSizeManager` コンポーネントでカスタムサイズの追加・削除・適用をポップアップ内でシームレスに実施
  - `prefers-color-scheme` によるダークモード自動対応（CSS変数切り替え）
  - フッターから「⚙ 設定を開く」で Options ページを新規タブで開く

- **ステップ3: ストレージロジック（`src/lib/storage.ts`）**
  - `@plasmohq/storage` を使用し、設定（Captureフォルダ名・storageArea選択）は常に `local` に保存
  - カスタムサイズ本体は設定で選択された `local`/`sync` の `Storage` インスタンスに保存・取得
  - Options画面で `storageArea` を切り替えた際は `migrateCustomSizes()` で既存データを新しい area にコピー

- **ステップ4: リサイズロジック（`src/lib/resize.ts`）**
  - `chrome.windows.update` によるウィンドウ全体サイズ変更
  - ビューポート基準リサイズは、現在のウィンドウ幅高さとビューポート幅高さの差分（ブラウザUI枠）を測定し、その差分を加算したウィンドウサイズに変更することで実現
  - `chrome.system.display.getInfo()` でアクティブウィンドウが乗っているディスプレイの解像度を取得し、カスタムサイズ入力時に「200px以上」「整数」「現在のディスプレイ解像度以下」をバリデーション

- **ステップ5: スクリーンショット撮影（`src/lib/screenshot.ts`, `src/background.ts`）**
  - 表示部分（Visible Tab）: `chrome.tabs.captureVisibleTab` でJPEG取得
  - ページ全体（Full Page）: `chrome.debugger` でCDPにアタッチし、`Page.getLayoutMetrics` でページ全体サイズを取得後、`Page.captureScreenshot`（`captureBeyondViewport: true`）でスクロール分も含めて一括キャプチャ
  - `chrome.downloads.download` で `Captures/screenshot_YYYYMMDD_HHMISS.jpg` 形式で保存（`conflictAction: "uniquify"` で重複時は自動リネーム）
  - popup とbackground（Service Worker）間は `chrome.runtime.sendMessage` / `onMessage` で通信

- **ステップ6: オプションページ（`src/options.tsx`）**
  - Captures フォルダ名を任意の文字列に変更可能
  - `storageArea`（local/sync）をラジオボタンで切り替え可能。切り替え時に既存カスタムサイズを自動移行
  - ダークモード対応

### 動作確認

- `npx tsc --noEmit` で型エラーなしを確認
- `npm run build` で `build/chrome-mv3-prod` に以下が正しく生成されることを確認
  - `manifest.json`（`action.default_popup`, `background.service_worker`, `options_ui.page` が自動設定されている）
  - `popup.html` / `popup.*.js` / `popup.*.css`
  - `options.html` / `options.*.js` / `options.*.css`
  - `static/background/index.js`（Service Worker）
  - アイコン一式

### 今後の実装予定（さらなる改善候補）

- E2E的な実機動作確認（Chromeへの読み込み・実際のリサイズ／スクリーンショット操作）はユーザー側での実施を推奨
- カスタムサイズの並び替えやテンプレート化、スクリーンショットのPNG/JPG形式選択など追加機能

## 権限（Permissions）について

| 権限 | 用途 |
|---|---|
| `tabs` | 現在のタブ情報の取得、タブ操作 |
| `activeTab` | アクティブタブへのスクリプト注入 |
| `storage` | 設定・カスタムサイズの保存（local/sync） |
| `downloads` | スクリーンショットの `Captures` フォルダへの保存 |
| `scripting` | ページ全体スクリーンショットのためのスクロール制御スクリプト注入 |
| `debugger` | Chrome DevTools Protocolを用いたフルページキャプチャ（`Page.captureScreenshot`） |
| `system.display` | カスタムサイズ入力時の現在ディスプレイ解像度の取得（バリデーション基準） |
| `host_permissions: <all_urls>` | 任意のページでのスクリーンショット・リサイズ操作 |

## バージョン管理

`package.json` の `version` フィールドで管理しています（現在: `0.2.0`）。機能追加・修正時にはSemVerに従いバージョンをインクリメントします。

| バージョン | 内容 |
|---|---|
| 0.1.0 | ステップ1: プロジェクト初期化（`package.json`/`tsconfig.json`/最小ボイラープレート/仮アイコン/`npm install`・ビルド動作確認） |
| 0.2.0 | ステップ2〜6: ポップアップUI・ストレージ・リサイズロジック・スクリーンショット・オプションページの実装、`src`ディレクトリ構成への移行 |