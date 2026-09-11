# Kunai の AI ハーネス設計 調査ノート

調査日: 2026-09-11
対象: `kunai-core-backend` / `kunai-ai` / `kunai-infra` / `kunai-core-frontend` と `kunai-claude-skills` プラグイン（すべてローカルの読み取り専用クローン）
目的: 「どういう仕組みで、各 AI ツールがどう読むか」を理解する。ルールの本文・コード・設定値は転載しない。

## 1. 全体像（3 本柱）

| 柱 | 何を解決するか | 主なファイル |
|---|---|---|
| rulesync によるルール生成 | 1 つの正から Claude Code / Cursor / Codex CLI 向けの指示ファイルを作る | `.rulesync/rules/*.md` → `CLAUDE.md`, `.claude/rules/`, `.cursor/rules/`, `AGENTS.md` |
| LLM レビュー | PR にラベルを付けると CI が方針に沿ってレビューする | `LLM_REVIEW_CONTEXT.md`, `.github/workflows/claude-code-review.yml` |
| 共通スキルのプラグイン化 | commit / PR / レビュー対応の手順を repo 横断で共有する | `kunai-claude-skills`（`skills/*/SKILL.md`）, 各 repo の `.claude/settings.json` |

## 2. rulesync の仕組み

### 入力
- `.rulesync/rules/*.md` だけが正。frontmatter は `root` / `targets` / `description` / `globs` の 4 項目
- `root: true` は 1 本だけ（`root.md`）。プロジェクト全体の方針
- `root: false` は層ごとの詳細ルール。`globs` をその層のディレクトリに一致させる（例: domains 層のルールは `src/domains/**/*.ts`）
- `rulesync.jsonc` で `targets`（claudecode / cursor / codexcli）、`features`（rules）、`delete: true`（古い生成物を消す）を指定

### 出力（本文はどの出力先でも byte 一致。frontmatter だけが変換される）

| 入力 | Claude Code | Cursor | Codex CLI |
|---|---|---|---|
| `root: true` | `./CLAUDE.md` に本文丸ごと | `.cursor/rules/root.mdc` | `AGENTS.md` の先頭 |
| `root: false` | `.claude/rules/<name>.md`。frontmatter は `paths:` のみ | `.cursor/rules/<name>.mdc`。`description` + `globs` | `AGENTS.md` に本文を連結 |

- backend の実測: `CLAUDE.md` 146 行、`.claude/rules/` 19 本、`AGENTS.md` は 20 本を連結した 4536 行
- `AGENTS.md` にはファイル境界もスコープ情報も残らない。各ファイル先頭の見出しだけが区切り

### 実行
- `make generate-rules` に統一。中身は `npx rulesync generate --features rules --targets claudecode,cursor,codexcli`
- backend / frontend は `package.json` の script 経由、ai は Makefile から直接（生成前に `.claude/rules` と `.cursor/rules` を `rm -rf`）、infra はフラグなし
- backend / ai は `make bootstrap` の最後に `generate-rules` を連鎖させ、環境構築時に必ず再生成
- 生成物はすべて git 管理。手で編集するとズレるが、再生成を強制する pre-commit / CI は未実装（rules 内に「将来やりたい」と記載）

### 旧方式との関係
- 旧 rulesync は `.claude/memories/*.md` に出力し、`CLAUDE.md` 冒頭に `@.claude/memories/...` の参照行を書く方式だった
- backend は 2026-03-04 に `.claude/rules/` 方式へ移行。infra は旧方式のまま
- backend の `LLM_REVIEW_CONTEXT.md` は `.claude/memories/` を参照したままで、移行時の直し漏れ

## 3. 各ツールの読み込み仕様（Claude Code は公式 docs で確認）

出典: https://code.claude.com/docs/en/memory.md, https://code.claude.com/docs/en/skills.md, https://code.claude.com/docs/en/settings-reference.md

- `CLAUDE.md` の階層: 管理ポリシー → `~/.claude/CLAUDE.md` → `./CLAUDE.md` または `./.claude/CLAUDE.md`（どちらか一方）→ `CLAUDE.local.md`。サブディレクトリの `CLAUDE.md` は、そのディレクトリのファイルを読んだときに遅延ロード
- `.claude/rules/*.md`: 公式機能。`paths` がなければ起動時に常時ロード、あれば一致するファイルを読んだときだけロード。サブディレクトリと `~/.claude/rules/` も可
- `@path` インポート: `CLAUDE.md` 内に `@相対パス`。最大 4 段。旧方式の `.claude/memories/` はこれで常時読み込みだったため、スコープ節約の効果はなかった
- `AGENTS.md`: Claude Code は読まない（docs に明記）。Codex CLI などの汎用向け。Claude Code で使うなら `@AGENTS.md` かシンボリックリンク
- `.cursor/rules/*.mdc`: Cursor 側の仕様。`description` + `globs` でスコープ付きロード
- `.claude/settings.json` の `enabledPlugins`: commit すると clone した全員でプラグインが有効化。スキルは `/plugin名:skill名` で出る
- `SKILL.md` frontmatter: `name` / `description` / `allowed-tools` / `disable-model-invocation` / `context: fork` / `paths` など。プラグイン配下の `skills/<name>/SKILL.md` がそのままスラッシュコマンドになる

frontend に `./CLAUDE.md` と `.claude/CLAUDE.md` の 2 枚があるのは両方読まれるためではない。`next dev` が自動注入するブロックを root 側だけに受け止めるための控え。

## 4. リポジトリ別の構成

### kunai-core-backend（TypeScript / Hono / Prisma）
- ルール 20 本。`root.md` は「方針 4 本柱 → 簡潔版コアルール → 新ドメイン時の判断質問（userContext か tenantContext か / snapshot に含めるか）→ 実装後は必ず `make fix` → Factory DI パターン」
- 層別: domains / usecases / routes / infrastructures / queries / authorization / error-handling / database / unit-tests / shared / scripts / fileIO / date-handling / lifecycle / kopilot
- 仕組み系（作業手順書としての rules）:
  - 変更検知 → Design Doc / ADR を書くかを決まった質問で対話する手順
  - 保存済み enum を読む経路だけ未知値をフォールバックさせる仕組みと、適用してはいけない enum の判断基準
  - 「X を変えたら Y の追従を確認せよ」の相互参照ペア（片方は「必須ではなく気づくためのチェック」と明記）
- 書き方の共通スタイル: ✅/❌ のコード対、強い callout、ディレクトリ図、判断質問、実障害のチケット番号を根拠に引用、mirror パスにテストを置く義務（domains / authorizers は必須、他は任意）
- 認可ルールの要点: 操作者 ID を無視する authorizer を許さない / テナントのミドルウェアは所属しか証明しないので対象リソースのテナント一致は authorizer が明示的に確認する / 異テナントの拒否テストを必ず書く
- DB ルールの要点: schema 変更は必ずマイグレーション / ローリングデプロイの共存期間があるので後方互換が既定 / 危険 4 操作（列削除・改名・NOT NULL 追加・型変更）は expand / contract に分割し contract は別 PR。PR テンプレートにも同じチェック項目がある

### kunai-ai（Python / FastAPI）
- ルール 10 本。Python 版の同じ層構成
- 特徴: logger シングルトン以外禁止、ログは例外ハンドラでだけ出す / 集約内は相対 import、集約間は絶対 import / Repository（永続化）と Adapter（外部サービス）を分ける / テストは parametrize + NamedTuple のテーブル駆動、`if` 禁止
- `.claude/skills/run-eval/SKILL.md`（約 3 万字）: 評価スタックの起動・実行・集計・後片付けを AskUserQuestion のゲート付きで手順化。prod 相当の操作は明示的な同意なしに選ばない
- `eval-check.yml`: `eval/**` の変更時だけ lock 整合・lint・単体テストを回す

### kunai-infra（Terraform）
- rulesync の対象は root と modules の 2 本。生成先は旧方式の `.claude/memories/`、`CLAUDE.md` から `@` 参照
- `.claude/claude-review-policy.md`: `terraform plan` の出力を PR コメントから読み「plan と PR の意図の整合」を最重要に置く。重大度は `[must] / [ask] / [nits]` の 3 段階。指摘がなければ無理に nits を作らない
- `terraform-apply-gate.yml`: Terraform を触る PR は apply 成功が merge の必須ステータス

### kunai-core-frontend（Next.js）
- ルール 10 本（app / page-components / components / services / styling / modal-style / error-handling / analytics / 独自描画エンジン）
- `.mcp.json` は playwright のみ
- `make check` に localStorage 直接利用を禁止する独自 lint
- `kenvas-review.yml`: 特定機能向けの opt-in レビュー。Claude に Bash を渡さず、PR 文脈の取得と投稿・合否判定は固定スクリプト側

## 5. LLM レビュー

- backend / ai / frontend は同じ 8 セクション構成の 1 枚: Context（非機能要件の優先順位を明記）/ Directory Map / Contracts（禁止 API と必須 API）/ Code Conventions / Security & Privacy / Domain Glossary & Invariants / Feature Flags / Review Scope and Format
- Scope は「PR 差分の静的解析のみ」。ビルド・実行・負荷・マイグレーション実行は対象外
- 出力は日本語固定。`## [カテゴリ] タイトル` → 実装者専用チェックボックス → 指摘内容 / 理由 / 改善案。カテゴリ 7 種（良い点 / 重大な問題 / 潜在的な問題 / 改善提案 / 小さな改善点 / 命名＆スタイル / 質問＆確認事項）。日本語の few-shot 例を 3 本埋め込み
- 起動は PR の `claude-code-review` ラベル。ファイルを `$GITHUB_OUTPUT` にエスケープして流し、`anthropics/claude-code-action` の prompt に注入。許可ツールは `gh` の read 系と `gh pr comment` のみ
- 別途 `@claude` メンションで起動する汎用 workflow もある
- CI では `.claude/rules` の遅延ロードが効かないため、レビュー用に 1 枚へ凝縮している

## 6. kunai-skills プラグイン

- `kencopa-claude-marketplace`（レジストリのみ）→ `kunai-claude-skills`（本体）。各 repo は `.claude/settings.json` の `enabledPlugins` 1 項目で有効化
- hooks も agents もなく `skills/*/SKILL.md` 5 本だけ。版は `plugin.json` の semver を専用コミットで上げる
- `commit`: status → diff → 英語 1 文のコミット。署名なし
- `pr`: PR テンプレートを `@` で読み、ブランチ名から Linear の issue を引く。`-p` push / `-u` 更新 / `-c` コミット再編（ユーザー承認必須）。Detail はコミットごとに 3 行 + リンク。Review Point だけは自動生成禁止で必ず対話
- `append-pr-detail`: PR 本文の Detail から記載済み SHA を抽出し、未記載分だけ追記
- `fix-review`: gh API 3 経路でコメント全収集 → `[x]` のものだけ対象 → 複数なら AskUserQuestion で順番 → 必ず EnterPlanMode → 実装 → `make fix && make check` → 返信内容を確認してからコミットリンク付きで返信
- `worktree-implement`: 対話でパラメータ収集 → 検証 → worktree 作成 + 計画ファイルと `CLAUDE.local.md` を配置 → サブエージェントにステップ実装・コミット・push を委譲
- `!` によるコマンド埋め込みと `@` によるテンプレート読み込みで動的な文脈を取り込む

## 7. 設計として読み取れる意図と注意点

- 常時読む量を最小にする: 方針は `root.md` に凝縮し、詳細は層ごとの `.claude/rules/` で遅延ロード。層 = ディレクトリ = ルール 1 本
- 正を 1 つにして生成物もコミットする: clone 直後からどのツールでも動く。代わりに生成物を手で直すとズレる。再生成の強制は未実装
- 仕組み系ルールを rules に置く: スタイルガイドだけでなく「X を変えたら Y」型の作業手順書としても使う。実障害を根拠に書く
- CI レビューは別の 1 枚に凝縮する: `.claude/rules` のスコープは CI で効かない
- 信頼境界を切る: 外部入力（PR 本文）を扱うレビューでは Claude に Bash を渡さず、投稿と合否判定は固定スクリプトに置く
- 移行の残骸に注意: 旧 `.claude/memories/` 参照が docs に残る、repo ごとに生成コマンドの書き方が違う、など

## 8. taskboard に持ち込むなら（未実施）

- `.rulesync/rules/` に root + 層別（api / ai / web）を本 repo のコードから書き起こす。globs は `api/src/domains/**/*.ts` のようにサービス接頭辞付き
- `make generate-rules` を追加し、生成物をコミット
- `LLM_REVIEW_CONTEXT.md` + PR テンプレート + ラベル起動 workflow
- `.claude/settings.json` で kunai-skills を有効化
