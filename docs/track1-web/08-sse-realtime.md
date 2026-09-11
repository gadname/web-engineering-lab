# 1-08 SSE とリアルタイム更新（任意）

> トラック: Track 1: Web 基礎 / 目安時間: 2 時間 / 前提: 06

## 学習目標
- SSE の仕組みと WebSocket との使い分けを説明できる
- ストリームをパースして UI に反映する流れを作れる
- キャッシュ更新ロジックを純関数化して単体テストできる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では SSE 用アプリを分離し compress / ログを適用しない（core-backend/src/app.ts）
>
> 実例: 参考実装では core-sse-client と sse-parser（core-frontend/src/services/shared/clients/sseClient/）
>
> 実例: 参考実装では 楽観的更新を純関数として切り出し単体テスト（core-frontend/src/services/http/schedule/helpers/apply-batch-operation-to-cache.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track1-web/08-sse-realtime/README.md`

SSE エンドポイントと FE 側パーサ、cache 更新純関数 + テスト

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
