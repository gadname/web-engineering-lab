# 1-04 認証: JWT と OIDC（Cognito）

> トラック: Track 1: Web 基礎 / 目安時間: 3 時間 / 前提: 03

## 学習目標
- JWT の構造と署名検証（JWKS・kid・aud/iss）を説明できる
- OIDC / Cognito の役割分担（IdP・トークン種別）を理解する
- 認証器を Strategy パターンで差し替え可能に設計できる

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では 401 を throw せず return する（OTel の span を Error 化しないため）（core-backend/src/shared/middlewares/auth/jwt/jwtAuthMiddleware.ts）
>
> 実例: 参考実装では cognito / development / loadTest の 3 実装（core-backend/src/shared/middlewares/auth/jwt/strategies/）
>
> 実例: 参考実装では 環境で認証器を選ぶ Factory（core-backend/src/shared/middlewares/auth/jwt/authenticatorFactory.ts）
>
> 実例: 参考実装では Amplify v6 + CookieStorage（core-frontend/src/services/shared/clients/authClient/cognitoAuthClient.ts）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
→ `exercises/track1-web/04-jwt-auth/README.md`

Bearer JWT ミドルウェアを Strategy で実装。`jose` で自前署名する dev 認証器と、`aws-jwt-verify` 用 Cognito 認証器を同じインターフェースで

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
