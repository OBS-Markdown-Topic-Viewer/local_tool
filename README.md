# サンプルイメージ

![Darkイメージ](https://github.com/OBS-Markdown-Topic-Viewer/local_tool/blob/main/sample_image/image.png)

![aotoriイメージ](https://github.com/OBS-Markdown-Topic-Viewer/local_tool/blob/main/sample_image/image2.png)

![Purpleイメージ](https://github.com/OBS-Markdown-Topic-Viewer/local_tool/blob/main/sample_image/image3.png)


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

# 話題リストの管理方法

- md/topic.mdにてマークダウン形式で話題の管理をしています。
- md/topic.mdの更新はDocker起動前、起動後どちらでも可能です。ファイルを更新・保存したタイミングで再読み込みします。

# 起動方法と停止方法

## windows

- OBSMarkdownViewer起動.batとOBSMarkdownViewer停止.batを利用してください

## Mac

- OBSMarkdownViewer起動.commandとOBSMarkdownViewer停止.commandを利用してください

## 表示確認

- http://localhost:8080/
- 上記URLに表示されるのでOBSのソース、ブラウザやウインドウ取り込みなどでご利用ください

# 操作方法（配信中）

このツールは、ローカルで起動している操作用 HTTP API に
POST リクエストを送信することで話題を操作します。

HTTP の POST リクエストを送信できる手段
（Stream Deck / curl / httpie 等）であれば操作可能です。

## 次の話題へ進む

http POST http://localhost:8080/next

## 前の話題へ戻る

http POST http://localhost:8080/prev

# テーマの変更方法

このツールでは、表示テーマを API 経由で切り替えることができます。
テーマは CSS ファイルとして管理されています。

現在利用可能なテーマは以下のとおりです。

- purple
- aotori
- dark

## テーマを切り替える

以下の URL を POST メソッドで呼び出してください。

http POST http://localhost:8080/theme/purple  
http POST http://localhost:8080/theme/aotori  
http POST http://localhost:8080/theme/dark  

切り替え後、画面は自動的に再描画されます。
OBS 側での再読み込みは不要です。

Stream Deck を利用する場合は、HTTP Request 系プラグインで
上記 URL をそのまま設定してください。

# 独自テーマの追加方法

利用者は、自分用のテーマを自由に追加できます。
以下の手順でテーマを作成してください。

## 1. テーマ用 CSS ファイルを作成する

styles フォルダ内に、以下の命名規則で CSS ファイルを追加します。

styles/theme-テーマ名.css

例：
- styles/theme-pink.css
- styles/theme-green.css

この CSS には、背景色・文字色・current 状態の色などを記述します。
共通レイアウトは base.css に含まれているため、テーマ側では色指定のみで問題ありません。

## 2. テーマ名を指定して切り替える

作成したテーマ名を URL に指定して POST します。

例：theme-pink.css を作成した場合

http POST http://localhost:8080/theme/pink

これで新しいテーマが適用されます。

## 3. 注意点

- ファイル名は必ず theme-◯◯.css の形式にしてください
- サーバー再起動は不要です
- OBS の再読み込みも不要です
- 色のコントラストは配信画面上で必ず確認してください

# Stream Deck 操作プロファイルの使い方（インポート方式）

このプロジェクトには、Stream Deck 用の操作プロファイル
OBS-Markdown-Topic-Viewer.streamDeckProfile が同梱されています。

このプロファイルを Stream Deck に取り込むことで、
話題操作・テーマ切替用のボタンが自動的に設定されます。

## 事前準備

- Stream Deck 本体が接続されていること
- Stream Deck アプリが起動できること
- インターネット接続があること
- Web Request（HTTP Request）系プラグインがインストールされていること

## プロファイルの取り込み手順

1. Stream Deck アプリを起動します
2. 画面右上の「設定（歯車アイコン）」を開きます
3. プロファイル管理画面を表示します
4. 「インポート」または「読み込み」を選択します
5. プロジェクト内の以下のファイルを指定します

   streamdeck/OBS Markdown Topic Viewer.streamDeckProfile

6. インポートが完了すると、
   「OBS Markdown Topic Viewer」というプロファイルが追加されます
7. 追加されたプロファイルを選択すると、
   話題操作・テーマ切替用のボタンが表示されます

## インポート後にできること

- 次の話題へ進む
- 前の話題へ戻る
- テーマ切替（purple / aotori / dark）

すべての操作は、ローカルで起動している
OBS Markdown Topic Viewer に対して即時反映されます。

## インポートに失敗した場合

Stream Deck のバージョンや環境によっては、
プロファイルのインポートに失敗することがあります。

その場合は、以下を確認してください。

- Web Request（HTTP Request）系プラグインがインストールされているか
- URL が http://localhost:8080 になっているか
- ツール（Docker）が起動しているか

どうしても読み込めない場合は、
各ボタンを手動で設定しても同じ動作になります。

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
