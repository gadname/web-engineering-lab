# 3-01 Docker 基礎とマルチステージビルド

ノート: `docs/track3-container-infra/01-docker-multistage.md`

## ゴール
app/api を 4 ステージ Dockerfile 化し、`docker run` で uid とサイズを assert するスクリプトを書く

## 手順
1. `templates/exercise/` の設定ファイルをこのディレクトリにコピーし、`package.json` の name を `docker-multistage` にする
2. <!-- TODO -->
3. `npm run check && npm test`

## 受け入れ条件
- [ ] イメージ / レイヤ / キャッシュの仕組みを説明できる
- [ ] base → builder → production → development の多段ビルドを書ける
- [ ] 非 root 実行・devDependencies 除去・イメージサイズ検証ができる
- [ ] `npm run check` が通る
- [ ] `npm test` が通る

## app への反映
<!-- TODO: この演習の成果を app/ にどう組み込むか -->
