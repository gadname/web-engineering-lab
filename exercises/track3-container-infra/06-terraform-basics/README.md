# 3-06 Terraform 基礎と環境分離

ノート: `docs/track3-container-infra/06-terraform-basics.md`

## ゴール
`app/infra/` に VPC（3AZ × public/private/db）と SG を書き、`validate` + LocalStack で apply

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `terraform-basics` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] state / provider / variable / locals / count の基本を使える
- [ ] 環境差を「ディレクトリ複製」ではなく変数と count で表現できる
- [ ] VPC の 3 層サブネット設計と SG ルール分離を書ける
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
