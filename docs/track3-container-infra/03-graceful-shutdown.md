# 3-03 サーバー運用基礎: keep-alive と graceful shutdown

> トラック: Track 3: コンテナ・インフラ / 目安時間: 2 時間 / 前提: 02

## 学習目標
- keep-alive timeout と LB idle timeout の関係（502 の原因）を説明できる
- SIGTERM を受けてから接続を閉じるまでの順序を設計できる
- オーケストレータの stopTimeout と整合させられる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では keepAliveTimeout > ALB idle_timeout、25 秒タイムアウト付き多段 shutdown（core-backend/src/node.ts）
>
> 実例: 参考実装では uvicorn --timeout-graceful-shutdown 110 と ECS stopTimeout 120（ai-backend/Dockerfile）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/03-graceful-shutdown/README.md`

`node.ts` 相当のサーバ起動 / 終了処理を実装し、compose の `stop_grace_period` で検証

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
