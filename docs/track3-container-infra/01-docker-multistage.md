# 3-01 Docker 基礎とマルチステージビルド

> トラック: Track 3: コンテナ・インフラ / 目安時間: 3 時間 / 前提: Track1 03

## 学習目標
- イメージ / レイヤ / キャッシュの仕組みを説明できる
- base → builder → production → development の多段ビルドを書ける
- 非 root 実行・devDependencies 除去・イメージサイズ検証ができる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 4 ステージ、npm prune --omit=dev、--chown、CMD の --import で OTel を先読み（core-backend/Dockerfile）
>
> 実例: 参考実装では 3 ステージ + uvicorn graceful shutdown を ECS stopTimeout から逆算（ai-backend/Dockerfile）
>
> 実例: 参考実装では 実イメージを起動して uid / 権限 / サイズを実測（agent-platform/.github/workflows/ci.yml）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/01-docker-multistage/README.md`

app/api を 4 ステージ Dockerfile 化し、`docker run` で uid とサイズを assert するスクリプトを書く

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
