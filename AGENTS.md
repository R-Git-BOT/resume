# AGENTS.md

## Project Overview

このリポジトリは、Markdownで書いた職務経歴書をHTMLに変換し、Cloudflare Pagesで公開する静的サイトです。

主な目的:

* `src/resume.md` を職務経歴書本文として管理する
* `npm run build` で `dist/index.html` を生成する
* Cloudflare Pagesでは `dist/` を公開ディレクトリにする
* GitHubの `main` ブランチへのpushをきっかけにCloudflare Pagesで自動ビルド・デプロイする

このプロジェクトでは、Laravel、PHPサーバー、DB、常駐バックエンドサーバーは使いません。

---

## Tech Stack

* Node.js
* markdown-it
* HTML
* CSS
* Cloudflare Pages
* GitHub

---

## Important Files

### Editable source files

* `src/resume.md`

  * 職務経歴書の本文
  * 表示内容を変更する場合は基本的にこのファイルを編集する

* `public/styles.css`

  * サイト全体の見た目
  * 日本語の読みやすさ、余白、行間、見出し階層を重視する

* `scripts/build.mjs`

  * MarkdownをHTMLへ変換するビルドスクリプト
  * 変更する場合は、`npm run build` が成功することを必ず確認する

* `README.md`

  * 人間向けの説明書
  * セットアップ手順やCloudflare Pages設定を更新する場合に編集する

* `DESIGN.md`

  * デザイン方針
  * UI、CSS、HTML構造を変更する場合は、事前に読むこと

* `PRODUCT.md`

  * サイトの目的、対象読者、印象、避けたい表現を定義する
  * Impeccableを使う場合は参照すること

---

## Generated / Do Not Edit

以下は生成物または依存ファイルなので、直接編集しないこと。

* `dist/`
* `node_modules/`
* `package-lock.json` は依存関係を変更した場合のみ更新する

`dist/` はCloudflare Pages上でも `npm run build` によって生成されるため、Git管理しない。

---

## Build and Verification

変更後は、必ず以下を実行する。

```bash
npm run build
```

見た目を確認する場合は以下も実行する。

```bash
npm run preview
```

確認ポイント:

* `dist/index.html` が生成されている
* トップページが404にならない
* 日本語の本文が読みやすい
* スマートフォン幅でも崩れない
* 余白、行間、見出し階層が不自然でない

---

## Cloudflare Pages Settings

Cloudflare Pagesの設定は以下を前提とする。

```txt
Framework preset: None
Build command: npm run build
Build output directory: dist
Production branch: main
```

Cloudflare Pages用に、`wrangler` やWorkersの設定を勝手に追加しないこと。

---

## Design Rules

このサイトは、日本語の職務経歴書・ポートフォリオサイトです。

対象読者:

* 採用担当者
* 転職エージェント
* エンジニア面接官

目指す印象:

* 読みやすい
* 信頼感がある
* 技術者らしい
* 落ち着いている
* 誠実

避けるもの:

* 派手すぎるグラデーション
* 過剰なアニメーション
* AI生成っぽい装飾
* 情報量の割に読みにくいレイアウト
* 職務経歴書として不自然な演出

CSSを変更する場合は、以下を重視する。

* 日本語本文の行間を広めに取る
* 見出し階層を明確にする
* セクション間の余白を適切に取る
* モバイル表示で読みづらくしない
* 色数を増やしすぎない
* 本文の可読性を装飾より優先する

---

## Resume Content Rules

`src/resume.md` の職務経歴本文を編集する場合は、以下を守る。

* 経験・実績・技術スタックを勝手に盛らない
* 実務経験が少ない技術を「主な技術」として強調しすぎない
* Laravelなど経験が相対的に少ない技術は、必要に応じて後ろに回す
* 個人情報、住所、電話番号、詳細な機密情報は含めない
* 企業名や案件情報について、公開に不適切な内容は含めない
* 面接で説明できない表現にしない

本文を大きく書き換える場合は、変更意図を明確にする。

---

## Impeccable Usage

Impeccableを使う場合は、作業前に以下を読む。

* `PRODUCT.md`
* `DESIGN.md`
* `AGENTS.md`

主な用途:

* `public/styles.css` の改善
* 日本語タイポグラフィの改善
* 余白、見出し、視線誘導の改善
* デザイン上の違和感の検出

Impeccableを使っても、職務経歴本文の事実関係を勝手に変更しない。

---

## Preferred Workflow

通常の作業手順:

1. 変更内容を確認する
2. 必要なファイルだけ編集する
3. `npm run build` を実行する
4. 可能なら `npm run preview` で表示確認する
5. 変更内容を要約する

Git操作を行う場合は、基本的に作業ブランチを使う。

例:

```bash
git switch -c feature/update-resume
```

作業完了後:

```bash
git status
git diff
npm run build
```

---

## Do Not Do

以下は行わないこと。

* `dist/` を手作業で編集する
* `node_modules/` を編集する
* Cloudflare Pages用の静的サイトなのに、勝手にWorkers構成へ変更する
* Laravel、Express、DBなどを勝手に追加する
* 職務経歴の内容を事実以上に盛る
* デザインを派手なLP風に寄せすぎる
* `src/resume.md` の本文を大きく変更したのに説明しない

---

## Final Response Requirements

作業完了時は、以下を簡潔に報告する。

* 変更したファイル
* 変更内容
* 実行したコマンド
* `npm run build` の結果
* 注意点があればその内容
