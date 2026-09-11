# 3-02 docker-compose とローカル開発環境

ノート: `docs/track3-container-infra/02-compose-local-dev.md`

## ゴール
app + db + db-test + LocalStack の compose と `Dockerfile.migration`

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `compose-local-dev` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] compose のネットワーク・volume・depends_on・healthcheck を使い分けられる
- [ ] LocalStack で AWS 依存をローカル再現できる
- [ ] マイグレーション用イメージを分離する理由を説明できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
