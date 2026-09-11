# 3-02 docker-compose とローカル開発環境

> トラック: Track 3: コンテナ・インフラ / 目安時間: 3 時間 / 前提: 01

## 学習目標
- compose のネットワーク・volume・depends_on・healthcheck を使い分けられる
- LocalStack で AWS 依存をローカル再現できる
- マイグレーション用イメージを分離する理由を説明できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 外部ネットワーク、LocalStack の init script、db / db-test 分離（core-backend/docker-compose.yml）
>
> 実例: 参考実装では マイグレーション専用イメージ（core-backend/Dockerfile.migration）
>
> 実例: 参考実装では compose を make に隠蔽し override を自動で拾う（core-backend/Makefile）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/02-compose-local-dev/README.md`

app + db + db-test + LocalStack の compose と `Dockerfile.migration`

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
