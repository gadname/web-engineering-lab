# 0-00 パッケージ管理と「プログラムが動く」まで

> トラック: Track 1 前段（学習メモ） / 前提: [オリエンテーション](../00-orientation/README.md)
>
> 公式モジュールではない。1-01 に入る前に、npm と実行の層を自分の言葉で固定する。
> 演習パッケージは `exercises/track1-web/01-hono-rest/`。

## 学習目標

- `package.json` / lockfile / `node_modules` の役割の違いを説明できる
- `npm ci` が実行ではなく「命令の実体をディスクに揃える」作業だと説明できる
- 型チェック・ランタイム・プロセス・アドレス空間を混同せずに使える
- npm / Yarn / pnpm の共通点と、なぜこの教材が npm かを言える

## 概要

Web API のコードは、自分で書いた TypeScript だけでは動かない。
HTTP サーバ・ルーティング・テストランナーなどは公開パッケージに頼り、
それらを **宣言 → 確定 → 配置** してから、Node プロセスとして初めて実行する。

このメモは「依存関係とは何か」と「プログラムが動くとは何か」を、
演習 `01-hono-rest` で実際に打った `npm ci` に結びつけて固定する。

## なぜ必要か

- **宣言と実体がズレると再現できない**。人によって入るバージョンが違うと、「動くはずなのに動かない」が説明不能になる
- **インストールと実行を混同すると、次の障害が解けない**。`node_modules` があることと、ポート 8787 で待ち受けていることは別イベント
- **後続モジュールの用語が全部この上に載る**。CI の `npm ci`、Docker のイメージ、graceful shutdown の SIGTERM は、いずれも「プロセスと依存の配置」の延長である

## 仕組み

### 依存関係

依存関係 = 自分のプログラムが動くために必要な、**自分では書いていないコードとそのバージョンの約束**。

直接依存は `package.json` に書いたもの。間接依存は、それがさらに頼っているもの。
`npm ci` が「added 59 packages」だったのは、直接 7 個だけでなく間接まで含めた数。

実行時に必要なものと、開発時だけ必要なものを分ける。

| 欄 | 意味 | この演習 |
|---|---|---|
| `dependencies` | 本番でも必要 | `hono`, `@hono/node-server` |
| `devDependencies` | 開発・テストだけ | `typescript`, `vitest`, `@biomejs/biome`, `tsx` |

`^4.12.19` は「4.12.19 以上、5 未満」。範囲の宣言であり、確定版ではない。

### 宣言・確定・配置

| ファイル | 役割 |
|---|---|
| `package.json` | 何が必要かの宣言（範囲つき） |
| `package-lock.json` | 実際にどれを入れるかの確定。間接依存まで記録 |
| `node_modules/` | ダウンロードされた実体。git には入れない |

```
宣言:     package.json
確定:     lockfile
配置:     node_modules
再現手段: npm ci
```

`npm ci` は lockfile どおりに `node_modules` を再現する。CI（Continuous Integration）向け。
`package.json` と lockfile が食い違うと失敗する。既存の `node_modules` を消して入れ直す。

`npm install` は範囲の中で再解決することがあり、人によって結果がズレうる。
教材が `npm ci` を指定するのは、全員が同じ依存で動くため。

`npm ci` は **実行ではない**。ディスクに命令の実体を揃えただけ。
`tsx` / `node` がプロセスを作って、初めて「動く」が始まる。

脆弱性警告（`npm audit`）はインストール失敗ではない。
学習用ローカルでは `npm audit fix --force` はしない（想定バージョンがずれうる）。

### パッケージマネージャ（npm / Yarn / pnpm）

3 つは rival というより、同じ仕事を速さ・再現性・ディスクの不満で作り直した系列。
倉庫（npm registry）は共通。違うのはクライアントの置き方と厳しさ。

| | 思想 |
|---|---|
| **npm**（2010） | Node に同梱された標準。この教材の選択（参考実装と同じ） |
| **Yarn Classic**（2016） | lockfile・並列 DL・オフラインキャッシュ。当時の npm の遅さと非再現への応答 |
| **pnpm**（2017） | 中身はマシン内に 1 回だけ保存し、リンクで貼る。未宣言の依存は見えない。速さは結果 |
| **Yarn Berry**（2020） | 既定で `node_modules` を作らず、zip + 解決マップ（PnP） |

共通してやること: 宣言を読む → レジストリから取る → lockfile に書く → `import` できる形で置く → `run` でスクリプトを起動する。

この教材が npm なのは速さのためではない。Node 22 に最初から入り、参考実装と同じだから。

### 「プログラムが動く」の層

日常語の「動く」は、CPU 実行と「期待した入出力」をまとめて指す。層を分ける。

| 層 | 分野 | この演習での意味 |
|---|---|---|
| ハードウェア | 計算機アーキテクチャ | CPU が命令をフェッチして実行している |
| OS | オペレーティングシステム | プロセスがあり、メモリと I/O が割り当てられている |
| 言語 | 言語処理系 | ソースが実行可能な形に変換され、ランタイムが評価している |
| ライブラリ | ソフトウェア工学 | 足りない命令（依存）が同じアドレス空間に載っている |
| アプリ | ネットワーク | 8787 で待ち、HTTP の要求に応答を返せている |

CPU が理解するのは機械語だけ。人間の TypeScript は、誰かが変換しない限り命令列ではない。

```
src/index.ts          人間向けのテキスト
    ↓ tsx（開発時）
JavaScript            Node が読めるテキスト
    ↓ Node.js / V8（JIT）
バイトコード → 機械語
    ↓
CPU が実行
```

`npm run dev` で起きること:

1. OS が **プロセス** を作る（独立した実行単位。自分用のメモリ空間を持つ）
2. その上に Node を載せる
3. CPU 時間を割り当て、命令実行を始める
4. `serve({ port: 8787 })` はシステムコールになり、OS がソケットを作って 8787 で待ち受ける

Web サーバが動いている = ブラウザや `curl` が 8787 に TCP 接続でき、HTTP のバイト列を受け取れる状態。

確認の目安:

- `node_modules` がある → 命令の部品がディスクにある（まだ動いていない）
- `tsx` / `node` のプロセスがいる → CPU 上で命令が進んでいる
- ポート 8787 が LISTEN → OS がそのプロセスにネットワークを渡している
- `curl` が JSON を返す → ハンドラまで制御が届いている

### 型チェック / ランタイム / アドレス空間

**型チェック**は実行ではない。動かす前に、ソース上の型の約束が破られていないかを `tsc` が読む。
`type-check` は `tsc --noEmit`（JS を出さず検査だけ）。8787 は開かない。
実行時の JavaScript に型注釈は残らない。壊れた値でも、検査をサボれば「動いて」しまう。

**ランタイム**は、ソースを命令にし、実行中のメモリ管理・タイマー・ネットワークを提供する環境。
この演習では **Node.js** がランタイム。中の JS エンジンが **V8**。

**同じアドレス空間**は、1 プロセスが自分のメモリとして使える番地の範囲。
`import { serve } from "@hono/node-server"` は、起動時にそのパッケージを **今の Node プロセスのメモリに読み、自分の関数と同じように呼べる** ということ。
`curl` は別プロセスなので `createApp` を呼べない。OS の TCP 経由でバイト列を送る。

```
ディスク上のソース
    ├─ 型チェック（tsc）… 約束の検査。実行しない
    └─ 起動（tsx → Node）
           ▼
      ランタイム（Node プロセス）
           ├─ 自分のコード
           ├─ hono など     ← 全部「同じアドレス空間」
           └─ 変数・オブジェクト
           ▼
      OS（別プロセスやネットワークとはここでつながる）
```

### `tsc` と `tsx`（取り違えやすい）

| コマンド | 役割 |
|---|---|
| `tsc --noEmit` | TypeScript コンパイラ。型検査だけ。Node には渡さない |
| `tsx watch src/index.ts` | TS をその場で JS にして **Node に渡す起動役**。ランタイム本体は Node |

`dev` は `tsx`、`type-check` は `tsc`。混ぜない。

### この演習の scripts

| script | 何をするか | 実行か |
|---|---|---|
| `dev` | `tsx watch` でサーバ起動 | 実行 |
| `type-check` | `tsc --noEmit` | 検査 |
| `lint` / `fix` | Biome | 検査 / 書き換え |
| `check` | type-check + lint | 検査 |
| `test` | Vitest | 実行（サーバ常駐とは限らない。`app.request()` はプロセス内でハンドラを呼ぶ） |

## 実例

> 実例: この教材は参考実装と同じく npm を採用している（オリエンテーションの前提環境）。
> 速さや pnpm のディスク節約ではなく、「Node に付属し、手順が 1 本になる」ことが理由。

> 実例: 演習 `01-hono-rest` は README の手順 1 が `npm ci`。配置が終わってから `npm run dev` と curl に進む。
> インストール成功とサーバ起動はログ上も別イベント。

## よくある落とし穴

- **`npm ci` の成功を「動いた」と思う**。揃えただけ。次はプロセス起動と curl
- **`tsc` と `tsx` を同一視する**。検査と起動は別プログラム
- **npm の依存と Track 2 の「依存方向」を同一視する**。前者は他人のライブラリ、後者は自分の層の向き（DIP）
- **`npm audit fix --force` で演習を直そうとする**。メジャーバージョンが上がり、想定とずれる
- **`node_modules` をコミットする**。正は lockfile。実体は各マシン / CI で `npm ci`

## 演習

このメモに専用演習はない。次は [1-01 HTTP と REST、Hono ルーティング](./01-hono-rest.md)。

手元の続き:

1. `exercises/track1-web/01-hono-rest` で `npm ci` 済み
2. `npm run dev` → `curl -i localhost:8787/health`
3. ノートの「仕組み」「落とし穴」を自分の実装と照らす

## この時点で固める CS 基礎

今は Track 1-01 の直前。**パッケージとプロセスの層を先に固定**し、HTTP の意味論に入る。
設計手法・コンテナの本編は後回しでよいが、「あとで同じ語が出る」ことだけ地図にしておく。

### 今やる（1-01 と同時でよい）

1. **プロセス / システムコール / ポート**
   今メモった層そのもの。サーバは「関数の集まり」ではなく、OS にソケットを頼んでいるプロセス。
   後で [3-03 graceful shutdown](../track3-container-infra/03-graceful-shutdown.md) が扱う SIGTERM は、このプロセスへの信号。
2. **HTTP を「TCP の上のメッセージ」として読む**
   次の本編。[1-01](./01-hono-rest.md) のメソッド・ステータス・ヘッダ。
   `curl -i` でステータス行とヘッダを目で見る。本文の JSON だけ見ない。
   正典は RFC 9110（[reading-list](../../references/reading-list.md)）。
3. **コンパイル時とランタイムを分けたまま進む**
   すでに `check`（検査）と `dev` / `test`（実行）が分かれている。
   後の [2-08 静的解析](../track2-design/08-testing-static-analysis.md) と [3-05 CI](../track3-container-infra/05-github-actions-ci.md) は、この `check` を機械が毎回走らせる話。
4. **宣言と確定（再現性）**
   `package.json` と lockfile の関係は、あとで何度も同じ形で出る。
   DB なら [1-03](./03-prisma-postgres.md) の schema とマイグレーション、
   インフラなら [3-06 Terraform](../track3-container-infra/06-terraform-basics.md) の宣言と state。
   今は「範囲の宣言だけでは再現できない。確定ファイルが要る」だけ押さえる。

### 今は深入りしない（語だけ区別する）

| 後で出る語 | 今の語との違い | モジュール |
|---|---|---|
| 依存方向 / DIP | npm のパッケージ依存ではない。自分のコードの層の向き | [2-01](../track2-design/01-layered-architecture.md) |
| DI（ファクトリ） | `createProjectRoutes(store)` でテスト用ストアを差し込む話。パッケージインストールではない | [1-01](./01-hono-rest.md) → [2-03](../track2-design/03-repository-factory-di.md) |
| Docker イメージ | `node_modules` を「別マシン用のファイルシステム」に焼き込む。今はプロセスが手元で動けばよい | [3-01](../track3-container-infra/01-docker-multistage.md) |
| 永続化 | プロセスが死ぬとインメモリの Map は消える。その先が DB | [1-03](./03-prisma-postgres.md) |

[オリエンテーション](../00-orientation/README.md) の順序は Track 1 (01→02→03) が先。04 以降は Track 2 と並行してよい。
基礎を飛ばして 2-01 の層分割に入ると、「依存」が npm の意味のまま残り、DIP が解けない。

### 1-01 で手を動かしながら確認すること

- ミドルウェアの onion（`await next()` の前が入るとき、後が出るとき）
- `notFound` は最上位アプリにしか効かない
- `app.request()` はポートを開かない。同じプロセス内でハンドラを呼ぶテスト

これはネットワークの「動いているサーバ」とは別の実行経路。ランタイムは同じ Node でも、ソケットは使わない。

## 参考資料

- npm: `package.json` / `npm ci` — https://docs.npmjs.com/cli/v10/commands/npm-ci
- Node.js の概要（プロセス、モジュール） — https://nodejs.org/docs/latest/api/
- RFC 9110 HTTP Semantics — https://www.rfc-editor.org/rfc/rfc9110
- MDN: HTTP レスポンスステータスコード — https://developer.mozilla.org/ja/docs/Web/HTTP/Status
- 教材の索引: [reading-list.md](../../references/reading-list.md)

## 確認問題

1. `npm ci` が成功したあと、まだ「サーバが動いている」と言えないのはなぜか
2. `package.json` の `^` と `package-lock.json` は、それぞれ何を約束しているか
3. `tsc --noEmit` と `tsx watch src/index.ts` の違いは何か。ランタイムはどちらか
4. `import { serve } from "@hono/node-server"` が「同じアドレス空間」の話になるのはなぜか。`curl` が同じことをできないのはなぜか
5. この教材が Yarn や pnpm ではなく npm な理由を、速さ以外の言葉で述べよ
6. あとで出る「依存方向」（2-01）と、今の「依存関係」は何が違うか
