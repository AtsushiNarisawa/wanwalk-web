# Core Web Vitals ベースライン 2026-05-19

Phase 2-B「テクニカル SEO」B-4 として、wanwalk.jp 全 8 ページのモバイル CWV を Lighthouse 13.3.0 で計測。

**測定日**: 2026-05-19
**計測ツール**: `npx lighthouse@13.3.0 --form-factor=mobile --throttling-method=simulate`
**Chrome flags**: `--headless --no-sandbox`
**測定者**: CTO スレッド（Phase 2-B 完遂）

> 注: 本計測は CTO ローカル環境（macOS / 自宅 WiFi）の Lighthouse Simulated Throttling 結果。Real-User (CrUX) とは差分あり。再計測は同条件で実施し相対変化を観測する。

---

## 1. 全 8 ページ サマリ

| page | URL | perf | LCP (ms) | CLS | TBT (ms) | FCP (ms) | SI (ms) |
|---|---|---:|---:|---:|---:|---:|---:|
| top | `/` | **57** 🟡 | **22,209** 🔴 | 0.001 ✅ | 84 ✅ | 8,004 🔴 | 8,004 🔴 |
| routes_list | `/routes` | **63** 🟡 | **30,394** 🔴 | 0.001 ✅ | 192 ✅ | 3,128 🟡 | 4,784 🟡 |
| areas_list | `/areas` | **65** 🟡 | 16,667 🔴 | 0.002 ✅ | 60 ✅ | 3,897 🟡 | 4,151 🟡 |
| spots_list | `/spots` | **55** 🟡 | 20,463 🔴 | 0.000 ✅ | 0 ✅ | **19,672** 🔴 | 19,672 🔴 |
| about | `/about` | **83** 🟢 | 4,092 🟡 | 0.003 ✅ | 38 ✅ | 2,643 🟡 | 2,643 🟡 |
| route_detail | `/routes/shonan-chigasaki-southern-beach` | **66** 🟡 | 15,546 🔴 | 0.006 ✅ | 63 ✅ | 3,951 🟡 | 3,951 🟡 |
| area_detail | `/areas/hakone-ashinoko` | **69** 🟡 | 16,219 🔴 | 0.038 ✅ | 91 ✅ | 2,801 🟡 | 3,767 🟡 |
| spot_detail | `/spots/tamagawa-kasenshiki-dogguran-tokyo-tamagawa` | **82** 🟢 | 4,215 🟡 | 0.001 ✅ | 53 ✅ | 2,617 🟡 | 2,989 🟡 |

### CWV しきい値（Google 公式・モバイル）
| 指標 | Good 🟢 | Needs Improvement 🟡 | Poor 🔴 |
|---|---|---|---|
| LCP | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| CLS | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| INP/TBT | TBT ≤ 200ms | TBT ≤ 600ms | TBT > 600ms |
| FCP | ≤ 1.8s | ≤ 3.0s | > 3.0s |
| Performance Score | ≥ 90 | 50-89 | < 50 |

---

## 2. 最重要な課題

### 🔴 LCP: 全 8 ページ中 6 ページが 4s 超え（うち 5 ページが 15s 超え）

最悪は **`/routes` 30.4s**、次が **`/` 22.2s**、`/spots` 20.5s。
about / spot_detail のみ 4.0-4.2s でかろうじて「Needs Improvement」帯。

> ⚠️ Simulated Throttling 結果は実際の Real-User 体感より厳しめに出る傾向（特に LCP）が知られる。Real-User の CrUX も別途確認する余地あり。

### 🔴 FCP: `/spots` で 19.7s

`/spots` の SI = 19.7s = FCP のため、**最初のコンテンツ表示まで 20 秒近く待たされている**。
原因: SSG / ISR 経由で 1,005 件の spot 一覧を一度に取得 + フォント/CSS 読み込みのブロッキング。

### 🟢 CLS は全 8 ページで 0.04 以下（健全）

レイアウトシフトはほぼ発生していない。**area_detail 0.038** が最大だが許容範囲内。

### 🟢 TBT は全 8 ページで 200ms 以下（健全）

Total Blocking Time は問題なし。インタラクション応答は良好。

---

## 3. 改善余地（Lighthouse opportunities）

全ページで共通する主要改善ポイント:

| 項目 | top | routes | spots | route_det | 平均 savings |
|---|---:|---:|---:|---:|---:|
| **unused-javascript** | 310ms | 460ms | 160ms | 1,070ms | ~500ms |
| **unused-css-rules** | 1,120ms | 1,210ms | 490ms | 1,250ms | ~1,000ms |
| **unminified-css** | 290ms | - | - | - | ~290ms |

### 候補改善 (CTO 検討)

| # | 改善案 | 対象 | 期待効果 | 工数 |
|---|---|---|---|---|
| C1 | LCP 画像の `priority` 属性 + `fetchPriority="high"` | top / route_detail のサムネ | LCP -1〜3s | 1h |
| C2 | Supabase Storage 画像 `next/image` 化漏れ確認 + sizes 属性最適化 | top / routes / areas / spots / route_detail | LCP -2〜5s | 2-3h |
| C3 | `/spots` 一覧ページの Pagination or Lazy Load 導入 | spots_list | FCP/LCP -5〜10s | 2-3h |
| C4 | Noto Serif JP の font-display: swap + preconnect | 全 8 ページ | FCP -300〜500ms | 30 分 |
| C5 | Unused CSS 削減（Tailwind purge / Critical CSS） | 全 8 ページ | LCP -500〜1,000ms | 1-2h |
| C6 | サードパーティ JS (GA4) の `next/script strategy="lazyOnload"` 化 | 全 8 ページ | TBT -50ms（既に良好なので副次的） | 30 分 |

---

## 4. 当スレッドで実装する改善（CEO 承認後）

### 推奨 Top 2: C1 (priority 属性) + C2 (next/image 漏れ確認)

LCP が最大の課題のため、画像最適化を優先。**B-4 改善実装ステップで着手**。

各改善後は同条件で Lighthouse 再計測し Before/After を本ファイル末尾に追記。

---

## 5. 次回再計測タイミング

- **B-2 Step 5-B 実装後**: 関連ルート表示追加で route_detail に追加クエリ + 画像 4 件 が増える → LCP 退行リスクあり
- **6 月末月次レビュー**: Phase 2-B 完遂効果の総合判定

## 関連メモリ

- [project_phase2_kickoff_2026_05_08](file) — Phase 2 全体戦略
- [project_phase_d_gsc_benchmark_2026_05_19](file) — 主 KPI 達成（直帰率 41%/滞在 3:46）

---

## 6. 改善後計測ログ（B-4 改善実装後に追記）

### 2026-05-19 改善 #1: preconnect 追加（commit `b27dc68`）

**変更内容**: `src/app/layout.tsx` の `<head>` に 3 つの preconnect 追加
- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com` (crossOrigin="anonymous")
- `https://jkpenklhrlbctebkpvax.supabase.co`

**期待効果**:
- TLS ハンドシェイク + DNS 解決を並列化
- LCP -100〜500ms（Real-User では mobile 4G で特に効きやすい）
- 全 8 ページに均一に効果

**After 計測**: ⚠️ **Vercel Bot Protection が連続 curl で発動して Lighthouse CLI 計測を遮断**。
本セッション内では Before/After 比較完了せず → **6 月末月次再計測 or CEO 手動 PSI** で確認。

**HTML 反映確認**: Vercel デプロイ完了後、本番 HTML の `<head>` 内に 3 つの preconnect ディレクティブが出現することを CEO がブラウザ DevTools の Network タブで確認できる（`view-source:https://wanwalk.jp/` で「preconnect」を検索）。

### 残改善候補（未着手・優先度順）

| # | 改善 | 工数 | 期待効果 |
|---|---|---|---|
| C2 | next/image 化漏れ確認 (top hero の `/object/public/` ↔ `/render/image/` パス) | 1h | LCP -1〜3s |
| C5 | Tailwind CSS purge / Critical CSS 抽出 | 1-2h | LCP -500〜1,000ms |

これらは Phase 2-C 以降の Step として温存。

---

### 2026-05-18 改善 #2: /spots を階層型に根本改造（commit `9b0957a` + `48b57fd`）

**動機**: 件数増加で破綻する設計を根本解決。短期的なページネーション/「もっと見る」対症療法ではなく、スケール耐性のある構造に。

**Before**:
- /spots HTML 920 KB (Vercel ダウンロード時実測)
- 274 件カードを inline style で SSR
- LCP 20.5s / FCP 19.7s（Simulated Mobile）
- 件数 1000+ で 3 MB に到達して破綻する設計

**After (構造)**:
1. **/spots (ハブ)** - 統計サマリ + カテゴリカード3つ + エリア別件数チップ26件 + 人気スポット10件 + JSON-LD ItemList 全件
2. **/spots/category/{viewpoint|park|dog_run}** - 30件/ページのページネーション
   - viewpoint 250件 → 9ページ
   - park 21件 → 1ページ
   - dog_run 3件 → 1ページ
3. **sitemap** に `/spots/category/{cat}?page=N` を11 URL 追加
4. **inline style → CSS class** (globals.css に `.ww-cat-card`/`.ww-area-chip`/`.ww-spot-row-link`/`.ww-pagination-*` 等)
5. **content-visibility: auto** で viewport 外の `<li>` を遅延 render
6. **React.cache** で generateMetadata と Page component の SQL 重複呼び出しを de-dup

**期待効果**:
- /spots HTML: 920 KB → 120-150 KB（**約 85% 削減見込み**）
- LCP: 20.5s → 4-6s 想定
- スケール耐性: 件数 1000+ でも /spots ハブ HTML サイズ横ばい・カテゴリページ数で吸収

**After 計測** — Vercel Bot Protection 遮断中:
- ⚠️ curl / Lighthouse CLI 両方が 403 で弾かれている状態
- CEO ブラウザでの実測待ち（下記検証 URL 参照）

### CEO 検証用 URL

1. **/spots ハブ**: https://wanwalk.jp/spots
   - DevTools Network タブで HTML サイズを確認（Before 920 KB → After 想定 ~120 KB）
   - PageSpeed Insights: https://pagespeed.web.dev/?url=https%3A%2F%2Fwanwalk.jp%2Fspots
2. **/spots/category/viewpoint** (page 1・最も件数多い): https://wanwalk.jp/spots/category/viewpoint
3. **/spots/category/viewpoint?page=2** （ページネーション確認）: https://wanwalk.jp/spots/category/viewpoint?page=2
4. **/spots/category/viewpoint?page=9** （最終ページ・10件のみ表示）: https://wanwalk.jp/spots/category/viewpoint?page=9
5. **/spots/category/park** (21件・1ページ完結): https://wanwalk.jp/spots/category/park
6. **/spots/category/dog_run** (3件・1ページ完結): https://wanwalk.jp/spots/category/dog_run
7. **sitemap.xml**: https://wanwalk.jp/sitemap.xml （`/spots/category/` 11 URL 追加確認）

### スケール耐性のシミュレーション

| 件数推移 | /spots ハブ HTML | viewpoint ページ数 |
|---|---|---|
| 現在（274件 SEO対象） | ~120KB（推定） | 9ページ |
| 1年後（500件） | ~125KB | 17ページ |
| 3年後（1500件） | ~140KB | 50ページ |

→ /spots ハブのサイズは件数増加に応じて緩やかに増えるのみ（エリアチップ件数表示の桁数増分）。**カテゴリページ数の増加で吸収**する設計。
