# 3-04 Observability: ログ・トレース・メトリクス

> トラック: Track 3: コンテナ・インフラ / 目安時間: 3 時間 / 前提: 03

## 学習目標
- ログ / トレース / メトリクスの 3 本柱と相関の仕組みを説明できる
- OpenTelemetry で自動計装し、collector サイドカーに送れる
- trace_id でログを横断検索できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 計装対象より先にロードする（core-backend/src/instrumentation.ts）
>
> 実例: 参考実装では OTLP 受信 → Datadog exporter（core-backend/ecs/otel-collector/config.yaml）
>
> 実例: 参考実装では Loki / Alloy / Grafana のローカルスタック（core-backend/docker-compose.observability.yml）
>
> 実例: 参考実装では trace_id / span_id の自動付与（core-backend/src/shared/logger/logger.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track3-container-infra/04-observability/README.md`

`--import=instrumentation.js` で OTel を有効化し、otel-collector + Loki / Grafana の compose で trace_id 検索

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
