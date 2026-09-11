# 2-06 認可の 2 層モデルとガード

ノート: `docs/track2-design/06-authorization-layers.md`

## ゴール
`IUserContextAuthorizer` / `ITenantContextAuthorizer` と Guard を実装し、表駆動テスト

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `authorization-layers` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] 認証と認可を分離し、認可をドメイン外に切り出せる
- [ ] ユーザー文脈 / テナント文脈の 2 層認可を設計できる
- [ ] 集約に閉じない事前条件を Guard として独立させられる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
