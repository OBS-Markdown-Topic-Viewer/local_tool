# OBS Markdown Topic Viewer API Specification

Base URL:
http://localhost:3000

この API は、配信中の話題位置（current）を制御するためのローカル専用 API です。
すべてのエンドポイントは POST メソッドを使用します。

## POST /next

現在の話題を 1 つ次へ進めます。

副作用:
- state.json の current が +1 されます
- HTML が再生成されます

レスポンス:
- 200 OK

## POST /prev

現在の話題を 1 つ前へ戻します。

制約:
- current は 0 未満にはなりません

レスポンス:
- 200 OK

## POST /goto/{index}

指定した番号の話題へ直接移動します。

パラメータ:
- index: 0 以上の整数

例:
POST /goto/3

レスポンス:
- 200 OK
- 不正な番号の場合は 400 Bad Request

## 備考

- 認証はありません（ローカル利用前提）
- 外部公開は推奨しません
