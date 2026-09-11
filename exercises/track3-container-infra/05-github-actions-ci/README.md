# 3-05 CI: GitHub Actions

ノート: `docs/track3-container-infra/05-github-actions-ci.md`

## ゴール
`pr-check-code / pr-unit-test / pr-integration-test` 相当の 3 本 + `act` でローカル実行

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `github-actions-ci` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] PR チェックを目的別ワークフローに分割できる
- [ ] npm / Docker のキャッシュと Testcontainers on CI を設定できる
- [ ] OIDC でクラウド認証する仕組みを説明できる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
