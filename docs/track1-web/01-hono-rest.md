# 1-01 HTTP と REST、Hono ルーティング

> トラック: Track 1: Web 基礎 / 目安時間: 2 時間 / 前提: なし

## 学習目標
- HTTP メソッド・ステータスコード・ヘッダの意味と使い分けを説明できる
- REST のリソース設計（URL・冪等性・エラー表現）を自分で決められる
- Hono のミドルウェアチェーンと登録順序の意味を理解する

## 概要
Web API は「HTTP という共通言語でリソースを操作する」仕組みである。
このモジュールでは、HTTP の語彙（メソッド / ステータス / ヘッダ）を正しく使い、
それを Hono のルーティングとミドルウェアに落とし込む。永続化・認証・スキーマ検証は後のモジュールに回し、
「1 リクエストがどう処理されて 1 レスポンスになるか」だけに集中する。

## なぜ必要か
- **クライアントとの契約になる**: 「作成は 201、見つからなければ 404」のような HTTP の意味論を守ると、
  フロントエンド・ブラウザ・CDN・監視ツールが追加説明なしに正しく振る舞う。逆に「常に 200 で body に success:false」のような
  API は、キャッシュもリトライもエラーレート監視も全部自前で作り直すことになる。
- **ミドルウェアの順序はバグの温床**: 認証の前にログを出せばトークンが漏れ、requestId の前にログを出せば追跡できない。
  順序を「なぜそうなのか」込みで決められることが、後の認証・観測モジュールの前提になる。

## 仕組み

### HTTP の語彙
| 要素 | 覚えること |
|---|---|
| メソッド | `GET` 取得（安全・冪等）/ `POST` 作成（非冪等）/ `PUT` 全置換（冪等）/ `PATCH` 部分更新 / `DELETE` 削除（冪等） |
| ステータス | `200` OK / `201` Created（+ `Location`）/ `204` No Content / `400` 入力不正 / `401` 未認証 / `403` 権限なし / `404` なし / `409` 競合 / `422` 意味的に不正 / `500` サーバ側 |
| ヘッダ | `Content-Type`（本文の型）/ `Location`（作成先）/ `Authorization`（後述）/ `X-Request-Id`（追跡） |

**冪等性**は「同じリクエストを何度送ってもサーバの結果状態が同じ」こと。応答が同じことではない。
`DELETE` を 2 回送ると 2 回目は 404 だが、「消えている」という状態は同じなので冪等である。

### REST のリソース設計
- URL は名詞（`/projects`, `/projects/:id`）。動詞は HTTP メソッドで表す
- コレクション（`/projects`）とメンバー（`/projects/:id`）で許可メソッドが違う
- エラーは本文の形を統一する（`{ error: { code, details } }`）。code は機械判定用、message は人間用
- 404 も JSON で返す。HTML の "Not Found" を返すと JSON を期待するクライアントがパースエラーで落ちる

### Hono の構造
```
root (Hono)
 ├─ GET /health                  ← ミドルウェア無し。LB のヘルスチェックはログを汚さない
 └─ api = new Hono().basePath("/api")
      ├─ use(requestId())        ← ① ID 採番
      ├─ use(requestLog())       ← ② ①の ID をログに出す
      └─ route("/projects", createProjectRoutes(store))
```

- **ミドルウェアは onion（玉ねぎ）構造**。`await next()` の前が「入るとき」、後が「出るとき」。
  登録順 = 外側から内側の順。ログを最外側に置くと「後段で何が起きても必ず記録される」
- **sub-app をファクトリ関数にする**（`createProjectRoutes(store)`）。依存を引数で受け取れば、テストで別実装を差し込める。
  これが依存性注入（DI）の最小形で、Track 2 の Factory パターンにつながる
- **`app.request()` でテスト**する。サーバを起動せず `fetch` と同じ引数でハンドラを呼べる。ポート衝突がなく高速

## 実例
> 実例: 参考実装では root アプリに `/health` だけを置き、`basePath("/api/core")` の API アプリに
> `requestId → requestContext → cors → compress → requestResponseLog` の順で共通ミドルウェアを積んでいる。
> SSE 用のアプリは別に作り、compress とリクエストログを適用しない（ストリームが壊れるため）。
> 順序の根拠はコメントで残されている（core-backend/src/app.ts）
>
> 実例: 参考実装では 1 エンドポイント 1 ファイルで、Zod スキーマ → 依存の組み立て → Usecase 実行という順に並ぶ
> （core-backend/src/routes/v1/protected/tenantContext/sites/getSites.ts）
>
> 実例: 参考実装ではヘルスチェックをミドルウェア無しで常に 200 にする。認証やログを通すと
> LB のヘルスチェックが認証エラーになったりログが溢れたりするため（core-backend/src/routes/health.ts）

## よくある落とし穴
- **`notFound` / `onError` は最上位アプリにしか効かない**。sub-app に設定して `route()` でマウントすると無視される。
  演習では最初 sub-app に置いて "404 Not Found" のテキストが返り、テストが JSON パースで落ちた
- **`c.req.json()` は壊れた JSON で throw する**。`catch` して `undefined` にし、バリデーションで 400 にする
- **省略と null を区別する**。`PATCH { description: null }` は「null にせよ」、`PATCH {}` は「変えるな」。
  `??` で潰すと区別できなくなる。演習の `validateUpdateProject` は `undefined` チェックで区別している
- **201 に `Location` を付け忘れる**。付けないと「作ったものがどこにあるか」をクライアントが推測することになる
- **`204` にボディを付ける**。仕様違反で、環境によっては接続が壊れる

## 演習
→ `exercises/track1-web/01-hono-rest/README.md`

Hono で `/api/projects` の CRUD をインメモリ実装し、`app.request()` で 14 ケースのテストを書く。
ミドルウェア順序を入れ替える、`notFound` を sub-app に移す、といった「壊してみる」手順を含む。

## 参考資料
- RFC 9110 HTTP Semantics（メソッド・ステータスの正典） — https://www.rfc-editor.org/rfc/rfc9110
- RFC 9457 Problem Details（エラー本文の標準形） — https://www.rfc-editor.org/rfc/rfc9457
- Hono: Routing / Middleware / Testing — https://hono.dev/docs/
- MDN: HTTP レスポンスステータスコード — https://developer.mozilla.org/ja/docs/Web/HTTP/Status

## 確認問題
1. `DELETE` は冪等なのに 2 回目が 404 を返してよいのはなぜか
2. ログミドルウェアを requestId ミドルウェアより先に登録するとどうなるか。onion 構造で説明せよ
3. `PATCH` で「description を消したい」と「description は触らない」をどう区別するか
4. ヘルスチェックを認証ミドルウェアの内側に置くと運用上何が起きるか
5. `app.request()` によるテストと、実際にポートを開くテストの違いと使い分けは
