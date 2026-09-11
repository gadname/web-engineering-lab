# 2-04 ユースケースとトランザクション

ノート: `docs/track2-design/04-usecase-transaction.md`

## ゴール
`@databaseTx` 相当のデコレータを実装し、Testcontainers でロールバックを検証

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `usecase-transaction` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] 1 ユースケース 1 責務でアプリケーション層を組める
- [ ] トランザクション境界を宣言的（デコレータ）に表現できる
- [ ] デコレータのコンパイル設定（TC39 / target）の落とし穴を知る
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
