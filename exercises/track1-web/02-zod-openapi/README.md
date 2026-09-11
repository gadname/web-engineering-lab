# 1-02 スキーマ検証とコードファースト OpenAPI

ノート: `docs/track1-web/02-zod-openapi.md`

## ゴール
01 の API を `@hono/zod-openapi` で「宣言」し直し、1 つの定義から **実行時検証・OpenAPI・静的型** の 3 つを得る。
生成した spec から `openapi-typescript` で型を作り、`openapi-fetch` の型付きクライアントでサーバと会話する。

## 手順
1. `npm ci`
2. `npm run dev` → `http://localhost:8787/api/swagger` を開き、Swagger UI から叩いてみる
3. `npm run generate` で `generated/openapi.json` と `generated/api.d.ts` を再生成する
4. `src/routes/projects/schemas.ts` の `name` に `.max(100)` を足す/外すなどして、spec・型・422 応答が同時に変わることを確認する
5. `src/shared/openapi.ts` の `json404` を `[status]: ...` の computed key に書き換えて、型エラーになることを確認する
6. `npm run check && npm test`

## 構成
```
src/
  app.ts                     OpenAPIHono。/api/doc（spec）と /api/swagger（UI）
  routes/projects/
    schemas.ts               Project / CreateProjectBody / UpdateProjectBody / path params
    index.ts                 createRoute() + .openapi() で 5 エンドポイント
  shared/
    createSchema.ts          スキーマに名前を付けて components/schemas に出す
    openapi.ts               request / responses のボイラープレートを畳む
    errors.ts                ErrorResponse スキーマと 422 に変換する defaultHook
  store.ts                   01 と同じインメモリストア
scripts/generateOpenapi.ts   app.request("/api/doc") をファイルへ
generated/
  openapi.json               ← npm run openapi:generate
  api.d.ts                   ← npm run client:generate（openapi-typescript）
tests/
  app.test.ts                422 の形、path 検証、spec の中身
  client.test.ts             openapi-fetch を app.request() に繋ぎ、型と実行時の両方を検証
```

## 受け入れ条件
- [x] バリデーション失敗が 422 + `ErrorResponse` 形で返る
- [x] 壊れた JSON は 400（`HTTPException` を `onError` で尊重）
- [x] `/api/doc` の `components/schemas` に名前付きスキーマが並ぶ
- [x] `generated/api.d.ts` の型で `openapi-fetch` クライアントが動き、`expectTypeOf` が通る
- [x] 契約に反するボディが `@ts-expect-error` で捕まる
- [x] `npm run check` が通る
- [x] `npm test` が通る

## app への反映
`app/api` はこの構成をそのまま採用している（`createSchema` / `openapi` ヘルパー / `defaultHook` / `/api/doc`）。
`app/api` では spec を `app/api/openapi.json` に出力し、Track 1-06 で `app/web` がそれを読んで型を生成する。
