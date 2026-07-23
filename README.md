# Video PiP Topmost

YouTubeとNetflixの再生中動画を検出し、Chrome標準のPicture-in-Pictureで
WindowsまたはmacOSの最前面に表示するManifest V3拡張機能です。

## インストール

1. Chromeで `chrome://extensions/` を開きます。
2. 右上の「デベロッパー モード」をオンにします。
3. 「パッケージ化されていない拡張機能を読み込む」を押します。
4. このフォルダ `C:\Users\yyone\Documents\video-P-I-P` を選択します。

## 使い方

1. YouTubeまたはNetflixで動画を再生します。
2. ツールバーの拡張機能アイコンから「Video PiP Topmost」を開きます。
3. 「PiPを開始・終了」を押します。

- Windows / Linux：`Alt + Shift + P`
- macOS：`Command + Shift + P`

ショートカットが競合する場合は `chrome://extensions/shortcuts` で変更してください。

PiPを開始した後はChromeを最小化したり、WindowsまたはmacOSの別アプリへ
切り替えたりしても、PiPウィンドウが最前面に残ります。

## 制約

- OSの通常ウィンドウを拡張機能だけで最前面固定することはできないため、
  WindowsとmacOSの両方でChrome標準のPiP APIを利用しています。
- NetflixはDRM動画です。ChromeやNetflixの仕様変更によってPiPが拒否される作品・
  状態が生じる可能性があります。
- PiP開始時はChromeのセキュリティ要件により、動画を一度クリックして再生しておく
  必要があります。
