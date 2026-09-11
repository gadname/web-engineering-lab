# 2-08 テスト戦略と静的解析

ノート: `docs/track2-design/08-testing-static-analysis.md`

## ゴール
GritQL カスタムルール 1 本（ドメイン層から Prisma import 禁止）と CI 用 check スクリプト

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `testing-static-analysis` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] unit / integration の分け方と、それぞれの config を設計できる
- [ ] カバレッジ閾値をどの層に課すか判断できる
- [ ] Biome + GritQL で独自の禁止ルールを書ける
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
