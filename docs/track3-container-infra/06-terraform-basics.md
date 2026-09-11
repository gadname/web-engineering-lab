# 3-06 Terraform 基礎と環境分離

> トラック: Track 3: コンテナ・インフラ / 目安時間: 4 時間 / 前提: 05

## 学習目標
- state / provider / variable / locals / count の基本を使える
- 環境差を「ディレクトリ複製」ではなく変数と count で表現できる
- VPC の 3 層サブネット設計と SG ルール分離を書ける

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 命名 locals（`${env}-<service>-<domain>`）の集約（infra/terraform/variables.tf）
>
> 実例: 参考実装では cidrsubnet と natgw_count（prod 3 / dev 1）（infra/terraform/vpc.tf）
>
> 実例: 参考実装では ingress / egress rule を別リソースで定義（infra/terraform/security_group.tf）
>
> 実例: 参考実装では provider alias によるドメイン分離（infra/terraform/aws.tf）
>
> 実例: 参考実装では HCP Terraform の cloud ブロック（infra/terraform/versions.tf）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/06-terraform-basics/README.md`

`app/infra/` に VPC（3AZ × public/private/db）と SG を書き、`validate` + LocalStack で apply

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
