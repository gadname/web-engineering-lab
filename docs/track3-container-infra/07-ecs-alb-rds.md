# 3-07 ECS Fargate + ALB + RDS

> トラック: Track 3: コンテナ・インフラ / 目安時間: 4 時間 / 前提: 06

## 学習目標
- ECS の cluster / service / task definition の責務を説明できる
- Terraform とデプロイツールの責務分離（ignore_changes）を設計できる
- SSM Parameter Store をリポジトリ間の契約面として使える

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では task_definition / desired_count を ignore_changes（infra/terraform/ecs.tf）
>
> 実例: 参考実装では TLS1.3・アクセスログ・host-based routing（infra/terraform/alb.tf）
>
> 実例: 参考実装では Aurora Serverless v2、env で instance count（infra/terraform/rds.tf）
>
> 実例: 参考実装では 84 パラメータが他リポとの契約面（infra/terraform/ssm.tf）
>
> 実例: 参考実装では jsonnet でタスク定義を DRY 化（core-backend/ecs/task-definitions/base.libsonnet）
>
> 実例: 参考実装では 秘匿値を state に載せない方針（冒頭コメント）（infra/terraform/batch.tf）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/07-ecs-alb-rds/README.md`

ECS / ALB / RDS を plan-only で書き、タスク定義を jsonnet 生成、SSM 経由で設定注入

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
