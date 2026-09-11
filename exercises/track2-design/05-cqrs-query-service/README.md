# 2-05 CQRS: QueryService

ノート: `docs/track2-design/05-cqrs-query-service.md`

## ゴール
`GetProjectsQueryService` IF + Prisma 実装、ページネーションと検索

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `cqrs-query-service` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] 読み書き分離の動機と適用範囲を説明できる
- [ ] 一覧・検索クエリを集約から切り離して実装できる
- [ ] ページネーションの設計（offset / cursor）を選べる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
