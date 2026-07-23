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
2. 再生バー内に表示されるPiPアイコンを直接押します。
3. 同じアイコンをもう一度押すとPiPを終了します。

YouTubeでは標準の再生ボタンと同じデザインでコントロールバー内に表示されます。
Netflixでは全画面ボタンの近くに表示され、再生バーと一緒に自動で隠れます。

- Windows / Linux：`Alt + Shift + P`
- macOS：`Command + Shift + P`

ショートカットが競合する場合は、ページ右下の緑色ボタンを使用してください。

PiPを開始した後はChromeを最小化したり、WindowsまたはmacOSの別アプリへ
切り替えたりしても、PiPウィンドウが最前面に残ります。

## 制約

- OSの通常ウィンドウを拡張機能だけで最前面固定することはできないため、
  WindowsとmacOSの両方でChrome標準のPiP APIを利用しています。
- NetflixはDRM動画です。ChromeやNetflixの仕様変更によってPiPが拒否される作品・
  状態が生じる可能性があります。
- PiP開始時はChromeのセキュリティ要件により、動画を一度クリックして再生しておく
  必要があります。
- 拡張機能のポップアップからページへ命令する方式ではChromeのユーザー操作判定が
  失われることがあるため、再生バー内のPiPボタンまたはページ上でのショートカットを
  使用します。

## トラブル対処

拡張機能アイコンを開くと、次の症状別の対処法を確認できます。

- PiP映像だけが止まり、元のChrome動画だけが動く
- 「PiPがChromeに拒否されました」と表示される
- 再生バーにPiPアイコンが表示されない

映像が止まる場合は、ポップアップからChromeのシステム設定を直接開き、
グラフィックアクセラレーションを切り替えてChromeを再起動できます。
