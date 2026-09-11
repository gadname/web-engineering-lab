# 3-08 デプロイ戦略と運用ガード

ノート: `docs/track3-container-infra/08-deploy-strategy.md`

## ゴール
plan fingerprint 再現スクリプト + `terraform-comment.yml` 相当の簡略ワークフロー

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `deploy-strategy` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] コメント駆動 plan / apply の流れと安全装置を説明できる
- [ ] stale plan を検知する fingerprint と apply ロックを再現できる
- [ ] per-PR preview 環境と rollback の設計を説明できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
