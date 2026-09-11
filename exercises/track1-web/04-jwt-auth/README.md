# 1-04 認証: JWT と OIDC（Cognito）

ノート: `docs/track1-web/04-jwt-auth.md`

## ゴール
Bearer JWT ミドルウェアを Strategy で実装。`jose` で自前署名する dev 認証器と、`aws-jwt-verify` 用 Cognito 認証器を同じインターフェースで

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `jwt-auth` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] JWT の構造と署名検証（JWKS・kid・aud/iss）を説明できる
- [ ] OIDC / Cognito の役割分担（IdP・トークン種別）を理解する
- [ ] 認証器を Strategy パターンで差し替え可能に設計できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
