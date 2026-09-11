# 3-05 CI: GitHub Actions

> トラック: Track 3: コンテナ・インフラ / 目安時間: 3 時間 / 前提: 04

## 学習目標
- PR チェックを目的別ワークフローに分割できる
- npm / Docker のキャッシュと Testcontainers on CI を設定できる
- OIDC でクラウド認証する仕組みを説明できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では type-check + biome（core-backend/.github/workflows/pr-check-code.yml）
>
> 実例: 参考実装では Testcontainers on CI（core-backend/.github/workflows/pr-integration-test.yml）
>
> 実例: 参考実装では GitHub OIDC provider と deploy ロール（infra/terraform/gh-action-linkage/）
>
> 実例: 参考実装では production イメージの起動確認（ai-backend/.github/workflows/image-smoke.yml）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/05-github-actions-ci/README.md`

`pr-check-code / pr-unit-test / pr-integration-test` 相当の 3 本 + `act` でローカル実行

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
