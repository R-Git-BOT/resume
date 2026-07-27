# Resume Site

Markdownの職務経歴書をHTMLに変換し、Cloudflare Pagesで公開する静的サイトです。

https://resume-9fn.pages.dev/ ← ここに公開されてる

## packgae.jsonの説明兼メモ書き

```jsonc
{
  //サイト名
  "name": "RESUME",
  //バージョン
  "version": "1.0.0",
  //npmライブラリを非公開
  "private": true,
  //モジュール方式で<script>タグ内のjsコードを読み込み
  "type": "module",
  //コマンドのエイリアス
  "scripts": {
    "build": "node scripts/build.mjs",
    "preview": "npx serve dist"
  },
  //マークダウン変換ライブラリ
  "dependencies": {
    "markdown-it": "^14.1.0"
  },
  //静的サイト用簡易サーバー
  "devDependencies": {
    "serve": "^14.2.4"
  }
}
```

## ビルド手順

npm install
npm run build
npm run preview
