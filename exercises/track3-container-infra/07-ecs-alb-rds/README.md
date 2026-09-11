# 3-07 ECS Fargate + ALB + RDS

ノート: `docs/track3-container-infra/07-ecs-alb-rds.md`

## ゴール
ECS / ALB / RDS を plan-only で書き、タスク定義を jsonnet 生成、SSM 経由で設定注入

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `ecs-alb-rds` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] ECS の cluster / service / task definition の責務を説明できる
- [ ] Terraform とデプロイツールの責務分離（ignore_changes）を設計できる
- [ ] SSM Parameter Store をリポジトリ間の契約面として使える
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
