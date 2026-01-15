# local_tool# OBS Markdown Topic Viewer
（話題管理ツール）

Markdownで記載した配信中の話題を OBS のブラウザソースに表示し、
Stream Deck やキーボード操作で「今話している話題（current）」を切り替えるためのツールです。

Docker 上で動作するため、Mac / Windows いずれの環境でも同じ手順で利用できます。

# 前提

- OS依存しないためにdockerが必要です。

### ① Docker Desktop のインストール（WSL2対応）

以下のリンクから Docker Desktop をダウンロード・インストール

https://www.docker.com/products/docker-desktop/

インストール時に「WSL2バックエンドを有効にする」にチェックを入れておく

Windows Terminal で確認（再起動後）

```bash
wsl --version
docker --version
```

Docker Desktop を起動し、正常に動いていることを確認

# 概要

- Markdownで配信中の話題を管理
- OBSのブラウザソースで表示（背景透過）
- 配信中に話題をワンアクションで切り替え可能
- Dockerにより環境依存なし

# 想定利用シーン

- 雑談配信・ラジオ配信の進行管理
- ゲーム配信中の話題メモ
- 告知忘れ防止
- 今どの話題を話しているかの可視化

# 操作方法（配信中）

このツールは、ローカルで起動している操作用 HTTP API に
POST リクエストを送信することで話題を操作します。

Stream Deck、curl、httpie など、
HTTP の POST リクエストを送信できる手段であれば操作可能です。

以下に記載している URL は、すべて POST メソッドで呼び出してください。

話題は、Markdown 内で「- （ハイフン＋スペース）」から始まる行が対象となり、
上から順に内部的な番号が割り振られます（0 から始まる連番）。

## 次の話題へ進む

http POST http://localhost:3000/next

- 現在の話題から次の話題へ移動します
- 配信中に最も頻繁に使用する操作です

## 前の話題へ戻る

http POST http://localhost:3000/prev

- 現在の話題からひとつ前に戻ります
- 話題を戻したい場合に使用します

## 番号を指定してジャンプ

http POST http://localhost:3000/goto/3

- 指定した番号の話題を current に設定します
- 番号は 0 から始まる連番で指定します
- 告知や特定コーナーへ一気に移動したい場合に便利です

## Stream Deck での操作

Stream Deck を使用する場合は、HTTP Request 系のプラグインを利用し、
以下の URL を POST メソッドで設定してください。

- 次の話題へ進む
  http://localhost:3000/next

- 前の話題へ戻る
  http://localhost:3000/prev

- 指定した話題へ移動
  http://localhost:3000/goto/任意の番号

# 必要環境

- Docker Desktop
- OBS Studio
- Stream Deck（任意）

Node.js をローカルにインストールする必要はありません。

# フォルダ構成

```
obs-md-viewer/
├─ README.md
├─ API.md
├─ docker-compose.yml
├─ Dockerfile
├─ package.json
├─ server.js
├─ render.js
├─ style.css
├─ state.json
├─ md/
│  └─ topic.md
├─ public/
│  └─ index.html
└─ streamdeck/
   └─ OBS-Markdown-Topic-Viewer.streamDeckProfile
```

# セットアップ手順

- プロジェクトを配置します

git clone ＜このリポジトリ＞
cd obs-md-viewer

- Docker を起動します

docker compose up --build

起動後、以下の URL が利用できます。

- 表示用
  http://localhost:8080

- 操作用 API
  http://localhost:3000

# OBS への設定

- OBSで「ソースを追加」から「ブラウザ」を選択します
- URL に以下を指定します

http://localhost:8080

- 背景色を透明に設定します
- サイズを配信解像度に合わせて調整します

# Markdown の書き方

- 「- （ハイフン＋スペース）」で始まる行が話題として扱われます
- 見出し（# や ##）は自由に使えます
- 箇条書きの順番がそのまま操作順になります

# 停止方法

Ctrl + C
docker compose down

© アトリエ清酒 清酒 渉 配信向け Markdown Topic Viewer
