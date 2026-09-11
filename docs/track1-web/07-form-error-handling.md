# 1-07 フォームとエラーハンドリング（FE）

> トラック: Track 1: Web 基礎 / 目安時間: 3 時間 / 前提: 06

## 学習目標
- react-hook-form + zod でフォームを型安全に組める
- API エラーを「フィールドエラー」と「トースト」に振り分ける設計ができる
- Container / Presentation の分割基準を説明できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 非 2xx を StructuredApiError / FetchError に変換（core-frontend/src/services/shared/clients/httpClient/middlewares/errorHandlingMiddleware.ts）
>
> 実例: 参考実装では コード別にトースト or setError（core-frontend/src/services/shared/exceptions/use-error-handler.ts）
>
> 実例: 参考実装では index.tsx（ロジック）+ presentation.tsx（見た目）（core-frontend/src/components/tenant-settings/label-settings/presentation.tsx）
>
> 実例: 参考実装では エラー処理の設計ルール（core-frontend/.rulesync/rules/error-handling.md）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track1-web/07-form-error-handling/README.md`

作成フォームを実装し、`errorHandlingMiddleware` 相当と `use-error-handler` 相当を作って Testing Library でテスト

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
