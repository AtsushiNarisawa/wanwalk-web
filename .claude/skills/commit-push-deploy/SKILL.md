---
name: commit-push-deploy
description: WanWalk Web（公開サイト wanwalk.jp）のコミット→push→Vercel自動デプロイの統一フロー。「コミットして」「プッシュして」「デプロイして」で発動。
---

# WanWalk Web Commit / Push / Deploy スキル

最終更新: 2026-08-13（wanwalk本体の commit-push-deploy から wanwalk-web 節を移植して自立化）

## トリガー

「コミットして」「プッシュして」「デプロイして」「本番反映して」と言われたとき。

## 概要

- 対象: 公開Webサイト https://wanwalk.jp（Next.js App Router on Vercel）
- **独立Gitリポジトリ**: 作業ディレクトリは `~/projects/wanwalk-web`
  （モバイルアプリ・管理画面は別リポジトリ `~/projects/wanwalk`。旧クローン `~/projects/wanwalk/wanwalk-web` は 2026-07-03 に削除済み。間違えてそちらで作業しない）
- 3リポジトリ（app / admin / web）は**同一 Supabase プロジェクト**（`jkpenklhrlbctebkpvax`）を共有。ルートデータの正本は Supabase

> **gitの安全作法（個別add・staged確認・日本語メッセージ・機密混入チェック等）の正本は
> `~/.claude/skills/git-safe-commit/SKILL.md`（共通コア）を参照。**

---

## 1. ビルド確認

```bash
cd /Users/atsushinarisawa/projects/wanwalk-web && npm run build
```

エラーゼロを確認してから次へ。

## 2. Commit

```bash
cd /Users/atsushinarisawa/projects/wanwalk-web
git add <変更ファイル>   # 個別add（作法は共通コア参照）
git commit -m "日本語でコミットメッセージ"
```

## 3. Push

```bash
cd /Users/atsushinarisawa/projects/wanwalk-web && git push origin main
```

## 4. Deploy（自動）

Vercel Git連携済み。pushすると自動でproductionデプロイが開始される。
本番URL: https://wanwalk.jp

### デプロイ状態確認

Vercel CLIで確認:

```bash
export PATH=$HOME/.npm-global/bin:$PATH
cd /Users/atsushinarisawa/projects/wanwalk-web && vercel inspect
```

失敗時は `mcp__vercel__get_deployment_build_logs` でログ確認（env不足が最頻原因）。

---

## 注意（このリポジトリ固有）

- URL 構造を変える変更は、旧 slug の 301 リダイレクトと GSC への影響を必ず確認する（`~/projects/wanwalk-web/CLAUDE.md` 参照）
- ルート作成・データ整合性の運用ルールは `~/projects/wanwalk/CLAUDE.md` と同 `.claude/skills/` が正本

## チェックリスト

- [ ] `npm run build` 成功
- [ ] git 安全作法は共通コアのチェックリストを満たしている
- [ ] push 先は `main` ブランチ
- [ ] Vercel デプロイ完了を確認（必要に応じて本番URLで表示確認）
