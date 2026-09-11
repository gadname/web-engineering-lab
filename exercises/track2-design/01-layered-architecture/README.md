# 2-01 レイヤードアーキテクチャと依存方向

ノート: `docs/track2-design/01-layered-architecture.md`

## ゴール
Track1 のアプリを `routes → usecases → domains ← infrastructures` に分割し、import 方向をテストで検証

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `layered-architecture` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] 4 層（presentation / application / domain / infrastructure）の責務を説明できる
- [ ] 依存逆転の原則を使い、ドメインが外側に依存しない構造を作れる
- [ ] アーキテクチャ規約をテストで機械的に守れる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
