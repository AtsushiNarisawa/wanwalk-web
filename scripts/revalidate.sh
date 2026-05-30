#!/usr/bin/env bash
# ============================================================================
# WanWalk 本番 ISR 再生成ヘルパー（W14 / Bot Protection 回避経路）
# ============================================================================
# DB のコンテンツ（ルート/エリア/スポット/件数など）を更新した後、該当ページの
# 静的キャッシュ（ISR）を即時再生成するための恒久スクリプト。
#
# 使い方:
#   scripts/revalidate.sh /about / /areas /routes
#   REVALIDATE_SECRET=xxxxx scripts/revalidate.sh /spots/some-slug
#
# secret の取得（どちらか）:
#   1. 環境変数 REVALIDATE_SECRET で渡す
#   2. リポジトリ直下に .env.local（vercel env pull で生成）を置く → 自動読込
#
# ★重要な運用ルール（過去の事故対策）:
#   - パスは「1リクエストにまとめて」渡す。N 回ループで個別に叩くと Vercel の
#     Bot Protection がバースト検知して 403/444 を返す（個別ループは厳禁）。
#     本スクリプトは渡された全パスを 1 回の POST に集約する。
#   - 許可パスは src/app/api/revalidate/route.ts の ALLOWED_PATH_PATTERNS に準拠。
#     未登録パスは API 側で skipped になる（追加時は route.ts も更新すること）。
#   - VERCEL_AUTOMATION_BYPASS_SECRET が設定されていれば x-vercel-protection-bypass
#     ヘッダを付与する。本番(wanwalk.jp)は Deployment Protection 無効のため通常不要。
#     Preview デプロイや将来 Protection を有効化した場合の保険。
#   - 全パスが skipped/失敗で revalidate 不能な緊急時は、空コミット push による
#     全 SSG 再生成がフォールバック（粒度は粗いが確実）。
# ============================================================================
set -euo pipefail

HOST="${REVALIDATE_HOST:-https://wanwalk.jp}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRET="${REVALIDATE_SECRET:-}"

# .env.local からの自動読込（手元運用向け・CI では env で渡す）
if [ -z "$SECRET" ] && [ -f "$SCRIPT_DIR/../.env.local" ]; then
  SECRET=$(grep -E '^REVALIDATE_SECRET=' "$SCRIPT_DIR/../.env.local" | head -1 | sed -E 's/^REVALIDATE_SECRET=//; s/^"//; s/"$//')
fi

if [ -z "$SECRET" ]; then
  echo "ERROR: REVALIDATE_SECRET が未設定です。" >&2
  echo "  env で渡すか、リポジトリ直下で 'vercel env pull' を実行してください。" >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  echo "usage: $0 <path> [<path> ...]" >&2
  echo "  例: $0 /about / /areas /routes" >&2
  exit 2
fi

# 引数のパス配列 + secret を JSON 化（secret は argv に出さず env 経由で渡す）
BODY=$(REVALIDATE_SECRET="$SECRET" python3 - "$@" <<'PY'
import json, os, sys
paths = [p.strip() for p in sys.argv[1:] if p.strip()]
print(json.dumps({"secret": os.environ["REVALIDATE_SECRET"], "paths": paths}))
PY
)

HEADERS=(-H "content-type: application/json")
if [ -n "${VERCEL_AUTOMATION_BYPASS_SECRET:-}" ]; then
  HEADERS+=(-H "x-vercel-protection-bypass: ${VERCEL_AUTOMATION_BYPASS_SECRET}")
fi

echo "POST $HOST/api/revalidate  (paths: $*)" >&2
curl -fsS -X POST "$HOST/api/revalidate" "${HEADERS[@]}" -d "$BODY"
echo
