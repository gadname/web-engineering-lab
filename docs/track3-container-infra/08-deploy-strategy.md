# 3-08 デプロイ戦略と運用ガード

> トラック: Track 3: コンテナ・インフラ / 目安時間: 3 時間 / 前提: 07

## 学習目標
- コメント駆動 plan / apply の流れと安全装置を説明できる
- stale plan を検知する fingerprint と apply ロックを再現できる
- per-PR preview 環境と rollback の設計を説明できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では dev → stg → prod 逐次 apply、全成功で自動マージ（infra/.github/workflows/terraform-comment.yml）
>
> 実例: 参考実装では apply 直前に再 plan して差分があれば中止（infra/.github/actions/tf-plan-fingerprint/）
>
> 実例: 参考実装では git ref をミューテックスにした apply ロック（infra/.github/actions/tf-lock-lib/lock.js）
>
> 実例: 参考実装では per-PR preview の共有基盤（infra/terraform/preview.tf）
>
> 実例: 参考実装では ラベル駆動で preview を upsert（core-backend/.github/workflows/preview-be.yml）
>
> 実例: 参考実装では ロールバック（core-backend/.github/workflows/rollback.yml）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/08-deploy-strategy/README.md`

plan fingerprint 再現スクリプト + `terraform-comment.yml` 相当の簡略ワークフロー

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
