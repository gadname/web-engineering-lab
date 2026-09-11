# 1-05 マルチテナントとリクエストコンテキスト

ノート: `docs/track1-web/05-tenant-context.md`

## ゴール
テナントミドルウェア + AsyncLocalStorage + winston で、全ログに requestId / tenantId が乗る API を作る

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `tenant-context` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] テナント解決（ヘッダ / パス）と越境防止の設計を説明できる
- [ ] AsyncLocalStorage でリクエスト情報を暗黙に伝播できる
- [ ] 構造化ログに requestId / tenantId を自動付与できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
