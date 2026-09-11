# 2-01 レイヤードアーキテクチャと依存方向

> トラック: Track 2: 設計手法 / 目安時間: 3 時間 / 前提: Track1 03

## 学習目標
- 4 層（presentation / application / domain / infrastructure）の責務を説明できる
- 依存逆転の原則を使い、ドメインが外側に依存しない構造を作れる
- アーキテクチャ規約をテストで機械的に守れる

- Clean Architecture + 境界線 + DDD 

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 4 層 + Factory DI の規約を明文化（core-backend/CLAUDE.md）
>
> 実例: 参考実装では 規約そのものをテストする（core-backend/tests/unit/architecture/dateHandling.test.ts）
>
> 実例: 参考実装では Python でも Protocol で同じ DIP を実現（ファイル冒頭に理由）（ai-backend/src/domains/workers/protocols/）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/01-layered-architecture/README.md`

Track1 のアプリを `routes → usecases → domains ← infrastructures` に分割し、import 方向をテストで検証

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
