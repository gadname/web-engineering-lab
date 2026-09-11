# 2-03 リポジトリとファクトリ DI

ノート: `docs/track2-design/03-repository-factory-di.md`

## ゴール
`IProjectRepository` + Prisma 実装 + InMemory 実装、Factory で組み立て

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `repository-factory-di` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] Repository インターフェースをドメインに、実装をインフラに置ける
- [ ] DI コンテナ無しで Factory + optional 引数の DI を組める
- [ ] テストでインメモリ実装に差し替えられる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
