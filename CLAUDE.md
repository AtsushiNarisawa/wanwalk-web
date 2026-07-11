@AGENTS.md

# WanWalk Web（公開サイト wanwalk.jp）

## これは何か
WanWalk の**公開Webサイト**（https://wanwalk.jp）。犬の散歩ルート・スポット・エリアを一般公開する Next.js アプリ。
2026-04-16 に旧 `dog-hub.shop/walks` から独立ドメインへ移管（dog-hub.shop/walks/* → wanwalk.jp/* に1段301リダイレクト）。

## リポジトリの位置づけ
- **本リポジトリ（wanwalk-web）= 公開サイトのみ**。モバイルアプリ（Flutter）と管理画面は別リポジトリの `~/projects/wanwalk`（wanwalk-app/・wanwalk-admin/）。
- 3つは別 Git リポジトリだが**同一 Supabase プロジェクト**（`jkpenklhrlbctebkpvax`）を共有。ルートデータの正本は Supabase。
- ルート作成・検証・データ整合性・デザイントークン等の運用ルールは `~/projects/wanwalk/CLAUDE.md` と同 `.claude/skills/`（route-ops / route-check / data-check）が正本。**当リポジトリで表示・SEOを触る前にそちらを参照**。

## 技術スタック
- Next.js（App Router）on Vercel ※`@AGENTS.md` の通り破壊的変更あり。実装前に `node_modules/next/dist/docs/` を確認
- Supabase（読み取り中心）／ TypeScript
- 主要ルーティング: `/areas`, `/routes/[slug]`, `/spots/category`

## MCP
- `.mcp.json`: supabase-wanwalk / vercel / playwright

## 注意
- SEO・sitemap・301 リダイレクトは移管時に整備済み。URL 構造を変える変更は旧 slug の 301 と GSC への影響を必ず確認（WanWalk の gsc-diff-monthly.md 参照）。
