# web-engineering-lab 開発ガイドライン

Web 基礎・設計手法・コンテナ/インフラを、実務プロダクト（参考実装）の設計を「実例」として参照しながら汎用的に学ぶリポジトリ。

## 目的と立ち位置
- **汎用教材**である。特定プロダクトの解説書ではない。ノートは一般的な概念の説明を主とし、実例は補足に留める。
- 実例は、ローカルにクローン済みの参考実装リポジトリを **読み取り専用** で参照する。`git pull --ff-only` 以外の操作を行わない。
- 演習は「小さく再実装して動かす」ことを重視する。写経ではなく、概念を taskboard ドメインで組み直す。

## 構成
| ディレクトリ | 役割 |
|---|---|
| `docs/` | ノート。トラック別に 1 モジュール 1 ファイル。雛形は `templates/note.md` |
| `exercises/` | 独立演習。1 モジュール = 1 npm パッケージ（`package.json` / `src/` / `tests/` / `README.md`）。雛形は `templates/exercise/` |
| `app/` | トラック横断で育てる積み上げアプリ **taskboard**（`api/` `web/` `infra/`） |
| `references/` | 参考実装のパス索引（`reference-map.md`）と参考資料（`reading-list.md`）。参考実装への参照が集約される唯一の場所 |
| `PROGRESS.md` | モジュール別の進捗チェックリスト |

## ノートの規約
- 日本語で書く。固定セクション: `概要 / なぜ必要か / 仕組み / 実例 / よくある落とし穴 / 演習 / 参考資料 / 確認問題`
- 実例は引用ブロックで書く: `> 実例: 参考実装では ...（core-backend/src/...）`。**コードの転載はしない**。パスと「なぜその設計か」の説明に留める
- 未完成の節には `<!-- TODO -->` を残し、完成時に消す。`PROGRESS.md` と整合させる

## 演習・app の規約
- Node 22 / npm / TypeScript strict / Biome / Vitest に統一。lockfile をコミットする
- 完了条件: `npm run check`（type-check + biome）と `npm test` が通る
- import は `@/` の絶対パスを使う（相対 import は同一ディレクトリ内のみ）
- `any` 禁止（`unknown` を使う）。欠損値は `undefined` より `null` を優先（JSON / DB 互換のため）
- ファイル名は camelCase（バックエンド）/ kebab-case（フロントエンド）。参考実装の慣習に合わせる
- 各演習 README には「ゴール / 手順 / 受け入れ条件 / app への反映」の 4 節を置く

## 禁止事項
- 参考実装のコード・Prisma スキーマ・SSM パス・AWS アカウント ID・Cognito 設定値などの転載
- 参考実装のリポジトリへの変更
- Terraform の AWS 実 apply（`validate` / `plan` / LocalStack のみ）

## よく使うコマンド
```bash
make setup      # 全演習と app の npm ci
make check      # 全演習と app の type-check + biome
make test       # 全演習と app の unit test
make up / down  # app の docker compose
```
