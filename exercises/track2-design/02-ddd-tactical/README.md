# 2-02 DDD 戦術パターン

ノート: `docs/track2-design/02-ddd-tactical.md`

## ゴール
基底クラス（Aggregation / Entity / ValueObject / Collection）を自作し Project 集約を実装。ドメイン単体テストで 90% カバレッジ

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `ddd-tactical` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] Entity / ValueObject / Aggregate / Collection を区別して実装できる
- [ ] 不変条件をコンストラクタとメソッドで守れる
- [ ] 集約境界とトランザクション境界の関係を説明できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
