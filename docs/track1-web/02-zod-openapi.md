# 1-02 スキーマ検証とコードファースト OpenAPI

> トラック: Track 1: Web 基礎 / 目安時間: 3 時間 / 前提: 01

## 学習目標
- リクエスト / レスポンスを Zod で契約として定義できる
- コードから OpenAPI を生成し、フロントに型として届ける流れを構築できる
- バリデーション失敗を統一されたエラーレスポンスに変換できる

## 概要
API の「契約」を 1 か所に書き、そこから **実行時の検証**・**OpenAPI ドキュメント**・**TypeScript の型** を同時に得る。
01 では手書きのバリデーションと暗黙のレスポンス形だったものを、Zod スキーマの宣言に置き換える。
さらに生成した spec からクライアント側の型を作り、「サーバとフロントが同じ契約を見ている」状態を作る。

## なぜ必要か
- **契約が散らばると壊れる**: バリデーション・ドキュメント・フロントの型を別々に書くと、
  1 つ直して 2 つ忘れる。API を変えたのにフロントの型が古いまま、というバグは実行時まで気づけない
- **境界での検証は省けない**: TypeScript の型はコンパイル時に消える。外から来る JSON は常に `unknown` であり、
  実行時に検証して初めて型を信用できる
- **ドキュメントは書くと腐る**: コードから生成すれば、常に実装と一致する。Swagger UI で試せるので QA や他チームとの会話も速い

### 設計の選択: コードファースト vs スキーマファースト
| | コードファースト（この演習） | スキーマファースト |
|---|---|---|
| 正 | サーバのコード（Zod） | OpenAPI YAML |
| 向く | サーバとフロントが同じチーム | 複数言語・外部公開 API |
| 弱点 | spec の表現力が Zod に縛られる | 生成コードと手書きの二重管理 |

## 仕組み

### 1 つの定義から 3 つを得る
```
createRoute({ request: { body: CreateProjectBody }, responses: { 201: Project, 422: ErrorResponse } })
        │
        ├─ 実行時   c.req.valid("json") が検証済みの値を返す。失敗は defaultHook へ
        ├─ ドキュメント  app.doc("/doc") が OpenAPI 3.0 を出力。components/schemas に名前付きで載る
        └─ 静的型   ハンドラの引数と c.json() の戻り値が responses の型で縛られる
```

### 名前付きスキーマ
`.openapi("Project")` を付けたスキーマは `components/schemas/Project` になり、各エンドポイントからは `$ref` で参照される。
`openapi-typescript` はこれを `components["schemas"]["Project"]` という 1 つの型にする。
名前が無いとエンドポイントごとにインライン展開され、フロントで「同じ形の別の型」が量産される。

### 検証失敗の扱い
- 「JSON として壊れている」→ `400 Bad Request`（Hono の validator が `HTTPException` を投げる）
- 「JSON は読めるが内容が契約に反する」→ `422 Unprocessable Entity`（`defaultHook` で変換）
- どちらも `ErrorResponse` の形（`error.code / message / details[]`）に揃える。フロントは `code` で分岐し、`details[].path` をフォームのフィールドに対応させる

### 型の流れ（サーバ → クライアント）
```
src/routes/**/schemas.ts  ─(app.doc)→  /api/doc  ─(scripts)→  generated/openapi.json
                                                       ─(openapi-typescript)→  generated/api.d.ts
                                                       ─(openapi-fetch)→  createClient<paths>() で型付き呼び出し
```
テストでは `fetch` を `app.request()` に差し替えて、サーバを起動せずに型付きクライアントを検証している。

## 実例
> 実例: 参考実装では `createSchema(shape, "v1GetSitesResponseSchema")` のように、スキーマ名を prefix にして
> 各 field にも openapi メタデータを付けるヘルパーを使う。名前の衝突を避けつつ生成された型に出所が残る
> （core-backend/src/routes/shared/helpers/createSchema.ts）
>
> 実例: 参考実装では `requestBody / response200 / responseSSE` などをまとめたヘルパーでルート定義の定型文を畳んでいる
> （core-backend/src/routes/shared/helpers/openAPISchema.ts）
>
> 実例: 参考実装では起動中のサーバの `/api/core/doc` を fetch して YAML に落とし、フロント側リポジトリで
> `openapi-typescript` に食わせる。演習ではインプロセスで `app.request()` した点が違う
> （core-backend/scripts/openapi/generate.ts）
>
> 実例: 参考実装のフロントは生成型を `services/http/<resource>/types.ts` で再エクスポートし、
> コンポーネントが生成物のパスを直接 import しないようにしている（core-frontend/src/services/http/sites/types.ts）

## よくある落とし穴
- **`responses` を computed key で書くと型が壊れる**。`{ [status]: {...} }` は TS がキーを `string` に広げ、
  ハンドラが 404 を返せなくなる。ステータスごとに関数を分ける
- **`onError` で全部 500 にしない**。Hono 自身が投げる `HTTPException`（壊れた JSON → 400）を潰すと、
  クライアントの入力ミスがサーバ障害としてエラーレートに乗る。`instanceof HTTPException` で分ける
- **path パラメータには `param` メタデータが要る**。`z.string().openapi({ param: { name, in: "path" } })` が無いと
  spec 上で `in: path` にならず、生成型からパラメータが消える
- **`.refine()` の後は ZodObject ではなく ZodEffects**。`createSchema` の戻り値に `.refine()` を足すと型が変わるので、
  ヘルパーの引数型を `ZodTypeAny` にしておく
- **`nullable()` と `optional()` は別物**。`description: string | null`（値として null）と
  `description?: string`（キーが無い）は、生成される型も OpenAPI も違う。01 の「省略と null の区別」がここで型になる
- **生成物をコミットするか**。演習ではコミットした（`generated/`）。実務では CI で再生成して差分が出たら失敗させる方が安全

## 演習
→ `exercises/track1-web/02-zod-openapi/README.md`

01 を `createRoute()` で宣言し直し、`/api/doc` から spec を出力、`openapi-typescript` → `openapi-fetch` で
型付きクライアントのテストまで通す。

## 参考資料
- OpenAPI Specification 3.0.3 — https://spec.openapis.org/oas/v3.0.3
- @hono/zod-openapi — https://github.com/honojs/middleware/tree/main/packages/zod-openapi
- Zod v3 — https://v3.zod.dev/
- openapi-typescript / openapi-fetch — https://openapi-ts.dev/
- RFC 9457 Problem Details（エラー本文の標準形。演習の ErrorResponse はその簡略版） — https://www.rfc-editor.org/rfc/rfc9457

## 確認問題
1. 400 と 422 をどう使い分けたか。その区別がフロントにとって何の役に立つか
2. スキーマに名前を付けないと、生成される TypeScript 型はどうなるか
3. `c.req.valid("json")` の戻り値の型はどこから来ているか
4. コードファーストとスキーマファーストの使い分け基準を 2 つ挙げよ
5. `fetch` を `app.request()` に差し替えたテストで検証できること・できないことは何か
