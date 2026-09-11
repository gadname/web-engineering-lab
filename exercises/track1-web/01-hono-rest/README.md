# 1-01 HTTP と REST、Hono ルーティング

ノート: `docs/track1-web/01-hono-rest.md`

## ゴール
Hono で `/api/projects` の CRUD をインメモリ実装し、HTTP の意味（メソッド・ステータス・ヘッダ）を `app.request()` のテストで検証する。

## 手順
1. `npm ci`
2. `npm run dev` で起動し、curl で叩いてみる
   ```bash
   curl -i localhost:8787/health
   curl -i -X POST localhost:8787/api/projects -H 'content-type: application/json' -d '{"name":"alpha"}'
   curl -i localhost:8787/api/projects
   curl -i -X PATCH localhost:8787/api/projects/<id> -H 'content-type: application/json' -d '{"description":null}'
   curl -i -X DELETE localhost:8787/api/projects/<id>
   ```
3. `src/app.ts` のミドルウェア登録順を入れ替えて、ログに requestId が乗らなくなることを確認する
4. `root.notFound` を `api.notFound` に移して、テストが落ちる理由を説明できるようにする
5. `npm run check && npm test`

## 構成
```
src/
  index.ts              サーバ起動（@hono/node-server）
  app.ts                アプリ組み立て。ミドルウェア順序・404/500 の統一
  routes/projects.ts    /projects の CRUD。ストアを引数で受け取る（最小の DI）
  middlewares/requestLog.ts  onion 構造を体感するためのログミドルウェア
  store.ts              IProjectStore と InMemory 実装
  validation.ts         手書きバリデーション（02 で Zod に置換）
tests/app.test.ts       app.request() によるテスト
```

## 受け入れ条件
- [x] `POST` が 201 + `Location` を返す
- [x] `DELETE` が 204（ボディ無し）、2 回目は 404
- [x] バリデーション失敗・壊れた JSON が 400
- [x] 未定義パスも JSON の 404
- [x] ログに requestId が乗る
- [x] `npm run check` が通る
- [x] `npm test` が通る

## app への反映
`app/api` の初期骨組みはこの構成をそのまま採用している（`createApp()` ファクトリ、`/health` を root に、API は `basePath("/api")`）。
02 で Zod-OpenAPI 化、03 でストアを Prisma に置き換える。
