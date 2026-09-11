# A-02 エージェント実行基盤のサンドボックス設計

> トラック: Appendix: AI エージェント基盤（ノートのみ） / 目安時間: 2 時間 / 前提: Track3 01

## 学習目標
- deny-by-default のツールポリシーと深層防御の考え方を説明できる
- Dockerfile の所有権・sticky bit で権限バイパスを塞ぐ手法を理解する

## 概要
<!-- TODO -->

## なぜ必要か
<!-- TODO -->

## 仕組み
<!-- TODO -->

## 実例
> 実例: 参考実装では root 所有 0444 の設定ファイル + 親 1770 で unlink を防ぐ（agent-platform/Dockerfile）
>
> 実例: 参考実装では 字面ベースの Bash 拒否リスト（agent-platform/src/tool-policy.ts）
>
> 実例: 参考実装では invoke ごとに認証ヘッダを差し替えるローカル MCP プロキシ（agent-platform/src/mcp-auth-proxy.ts）
>
> 実例: 参考実装では 設計判断の長文記録（agent-platform/README.md）

<!-- TODO: 上記パスを読み、「なぜその設計か」を自分の言葉で 3〜5 行にまとめる -->

## よくある落とし穴
- <!-- TODO -->

## 演習
このモジュールに演習はない。ノートのみ。

## 参考資料
- <!-- TODO -->

## 確認問題
1. <!-- TODO -->
