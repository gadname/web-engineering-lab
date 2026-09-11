# 2-08 テスト戦略と静的解析

> トラック: Track 2: 設計手法 / 目安時間: 3 時間 / 前提: 07

## 学習目標
- unit / integration の分け方と、それぞれの config を設計できる
- カバレッジ閾値をどの層に課すか判断できる
- Biome + GritQL で独自の禁止ルールを書ける

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では noExplicitAny: error、overrides で path 別ルール（core-backend/biome.jsonc）
>
> 実例: 参考実装では 構文レベルの独自禁止ルール（core-backend/plugins/calendarDatePair.grit）
>
> 実例: 参考実装では coverage を domains / authorizers に限定して 90%（core-backend/vitest.config.ts）
>
> 実例: 参考実装では autouse fixture で外部 SaaS への誤送信を封じる（ai-backend/tests/unit/conftest.py）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/08-testing-static-analysis/README.md`

GritQL カスタムルール 1 本（ドメイン層から Prisma import 禁止）と CI 用 check スクリプト

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
