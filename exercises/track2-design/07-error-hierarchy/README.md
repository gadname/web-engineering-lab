# 2-07 エラー階層とレスポンス整形

ノート: `docs/track2-design/07-error-hierarchy.md`

## ゴール
例外階層 + エラーコード定数 + `errorResponseFormatter` を実装し、OpenAPI にエラースキーマを反映

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `error-hierarchy` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] 層ごとの例外クラスとエラーコードを設計できる
- [ ] エラーレスポンスを単一の整形経路に集約できる
- [ ] 監視（エラーレート）を意識した 4xx / 5xx の扱いを説明できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
