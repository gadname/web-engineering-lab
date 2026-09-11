# 3-04 Observability: ログ・トレース・メトリクス

ノート: `docs/track3-container-infra/04-observability.md`

## ゴール
`--import=instrumentation.js` で OTel を有効化し、otel-collector + Loki / Grafana の compose で trace_id 検索

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `observability` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] ログ / トレース / メトリクスの 3 本柱と相関の仕組みを説明できる
- [ ] OpenTelemetry で自動計装し、collector サイドカーに送れる
- [ ] trace_id でログを横断検索できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
