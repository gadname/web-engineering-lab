# 3-03 サーバー運用基礎: keep-alive と graceful shutdown

ノート: `docs/track3-container-infra/03-graceful-shutdown.md`

## ゴール
`node.ts` 相当のサーバ起動 / 終了処理を実装し、compose の `stop_grace_period` で検証

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `graceful-shutdown` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] keep-alive timeout と LB idle timeout の関係（502 の原因）を説明できる
- [ ] SIGTERM を受けてから接続を閉じるまでの順序を設計できる
- [ ] オーケストレータの stopTimeout と整合させられる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
