# 2-02 DDD 戦術パターン

> トラック: Track 2: 設計手法 / 目安時間: 4 時間 / 前提: 01

## 学習目標
- Entity / ValueObject / Aggregate / Collection を区別して実装できる
- 不変条件をコンストラクタとメソッドで守れる
- 集約境界とトランザクション境界の関係を説明できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 基底クラス群（Symbol brand で型的に集約を識別）（core-backend/src/domains/shared/dddObjectBases/）
>
> 実例: 参考実装では private constructor + validateConstructorArgs、上限値にコメントで根拠（core-backend/src/domains/site/site.ts）
>
> 実例: 参考実装では VO の実装例（core-backend/src/domains/site/valueObjects/）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track2-design/02-ddd-tactical/README.md`

基底クラス（Aggregation / Entity / ValueObject / Collection）を自作し Project 集約を実装。ドメイン単体テストで 90% カバレッジ

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
