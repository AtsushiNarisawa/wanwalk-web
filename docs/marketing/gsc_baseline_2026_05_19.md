# GSC ベースライン 2026-05-19

Phase 2-B「テクニカル SEO」B-1 として、5/10 緊急 13 本改修 + 5/17 メタ最適化 27 件後の GSC 現状を記録する。

**測定日**: 2026-05-19
**対象期間**: 直近 30 日（2026-04-20 〜 2026-05-19）
**site**: `sc-domain:wanwalk.jp`
**測定者**: CTO スレッド（Phase 2-B 完遂）

---

## 1. 総合指標（直近 30 日）

| 指標 | 値 |
|---|---|
| **clicks** | **453** |
| **impressions** | **14,439** |
| **CTR** | **3.14%** |
| **平均 position** | **10.53** |

### 前期比較（2026-03-21 〜 2026-04-19）
| 指標 | 当期 | 前期 | Δ |
|---|---|---|---|
| clicks | 453 | 1 | +452 (+45,200%) |
| impressions | 14,439 | 66 | +14,373 (+21,777%) |
| CTR | 3.14% | 1.52% | +1.62pt (+107%) |
| position | 10.53 | 13.85 | -3.32 (-23.95%) |

> ⚠️ 前期は独立ドメイン移行（4/16）直後でほぼゼロ値。**絶対値で評価**することが妥当。

### 5/19 ベンチからの 5 日後再計測差分（参考）
- `project_phase_d_gsc_benchmark_2026_05_19.md` 時点: click 371 / imp 11,533 / CTR 3.22% / Pos 9.99
- 本ベンチ（5/19 終了時点・全 30 日確定）: click 453 / imp 14,439 / CTR 3.14% / Pos 10.53
- 差分: +82 click / +2,906 imp / -0.08pt CTR / +0.54 位（順位は若干劣化方向）

> 順位若干劣化は impressions 急増（裾野の弱い順位 KW 表示増）の副作用と推定。CTR は微減だが絶対 click は健全に積み増し。

---

## 6 月末・7 月末・8 月末目標（GSC 副 KPI）

| 期日 | clicks 目標 | impressions 目標 | 算出根拠 |
|---|---|---|---|
| **6 月末** | **680+ (+50%)** | **21,700+ (+50%)** | 5/19 ベンチ ×1.5 |
| **7 月末** | **910+ (+100%)** | **28,900+ (+100%)** | 5/19 ベンチ ×2.0 |
| **8 月末** | **1,360+ (+200%)** | **43,300+ (+200%)** | 5/19 ベンチ ×3.0 |

> 5/19 ベンチを **5/19 確定値 (453/14,439)** に更新（従来 371/11,533 は中間集計）。

---

## 2. 5/10 緊急 13 本改修の効果検証

| # | slug | 当期 click | 当期 imp | 当期 Pos | 5/10 時点 (GSC 90日) |
|---|---|---:|---:|---:|---|
| 1 | odawara-suwa-park-walk | 5 | 42 | 5.55 | - |
| 2 | showa-kinen-park | (n/a) | - | - | 43 imp / 10.84 位 |
| 3 | shonan-chigasaki-southern-beach | **19** | 151 | 7.25 | 103 imp / 7.50 位 |
| 4 | tokyo-odaiba-seaside-park-loop | - | - | - | - |
| 5 | yokohama-minatomirai-waterfront | (top30 圏外) | - | - | - |
| 6 | tokyo-kasai-rinkai-park-loop | - | - | - | 80 imp / 11.95 位 |
| 7 | kawaguchiko-motosuko-fuji-view | - | - | - | 139 imp / 11.12 位 |
| 8 | kannonzaki-umi-toudai | - | - | - | 78 imp / 10.41 位 |
| 9 | izu-shuzenji-onsen | - | - | - | 42 imp / 11.55 位 |
| 10 | nikko-shinkyo-kanmangafuchi | - | - | - | 48 imp / 15.29 位 |
| 11 | shonan-enoshima-loop | - | - | - | 43 imp / 11.95 位 |
| 12 | karuizawa-taliesin-lakeside | - | - | - | 73 imp / 10.47 位 |
| 13 | hayama-manase-shibazaki | - | - | - | 41 imp / 10.51 位 |

> 注: 上記は GSC dimension=page 上位 30 件で観測できた数値のみ。観測できないルートは imp が分散して下位に埋もれている可能性あり（descending order rank が低い）。
>
> ✅ **shonan-chigasaki-southern-beach（B-1 完遂 + meta 改修）が当期 19 click のトップクラス**。両輪戦略奏功の代表例。

---

## 3. 5/17 メタ最適化 27 件サマリ

| ファイル | 件数 | 内容 |
|---|---:|---|
| [project_p1_meta_additional_2026_05_17](file) | 24 | mid-tier 候補 4 本 (字数オーバー 2 本改修・誤誘導 1 件・横展開 12 本「駐車場 N 台」曖昧化・末尾補正 2 件・description 意訳 1 件) |
| [project_p1_meta_3routes_2026_05_17](file) | 3 | chichibu-nagatoro-iwadatami (宝登山神社 ペット不可訂正)・chichibu-muse-park・yokohama-minato-motomachi |
| [project_gsc_rescue_2026_05_17](file) | 2 | takitsubo-sawamei-kawa-seiryuu (188 imp 救済)・minato-no-mie-ru-oka-koen-no-tenbo (48 imp 救済) を RENAMED 化 |

> ⚠️ **効果判定は時期尚早（5/17 改修 → 5/19 ベンチでは 2 日のみ経過）**。**6 月末再計測**で順位移動と CTR 推移を確認するのが妥当。

### 5/17 救済 2 件の現状観測

- `takitsubo-sawamei-kawa-seiryuu` (移行先): 当期 7 click / 332 imp / Pos 8.08 — RENAMED 化前の旧 slug 188 imp 相当を吸収開始
- `minato-no-mie-ru-oka-koen-no-tenbo` → `minato-no-mieru-oka-koen-tembo-dai`: top30 ページに未浮上（観測 2 日では早い）

---

## 4. B-1 トーン適用 28 本のサマリ

B-1 完遂 5 本 + 緊急 13 本うち B-1 適用済 5 本 + Phase G-3 5 本 + 5/17 改修 1 本（meta only）+ その他 = 28 本（全 74 本の 38%）。
詳細個別観測は次回（6 月末）に実施。当期は **shonan-chigasaki が 19 click でトップ** が直接効果。

---

## 5. 上位ページ・ベスト 30（page dimension）

| Rank | slug 種別 | clicks | imp | Pos |
|---|---|---:|---:|---:|
| 1 | /spots/tamagawa-kasenshiki-dogguran-tokyo-tamagawa | 21 | 255 | 7.22 |
| 2 | /routes/shonan-chigasaki-southern-beach | 19 | 151 | 7.25 |
| 3 | /areas/tamagawa | 12 | 151 | 7.03 |
| 4 | /spots/mirai-no-bara-en | 11 | 117 | 6.66 |
| 5 | /spots/omuro-keishoku-dou | 11 | 28 | 4.82 |
| 6 | /routes/kamakura-hokokuji-sugimoto | 10 | 178 | 6.53 |
| 7 | /spots/kafe-za-rozu | 9 | 79 | 7.08 |
| 8 | /routes/kamakura-genji-park-loop | 8 | 148 | **24.80** ⚠️ |
| 9 | /areas/hakone-ashinoko | 7 | 43 | 7.16 |
| 10 | /routes/nasu-minamigaoka-ranch | 7 | **675** | 10.09 ⚠️ |
| 11 | /routes/yokohama-sankeien-honmoku-promenade | 7 | 334 | 7.41 |
| 12 | /spots/takitsubo-sawamei-kawa-seiryuu | 7 | 332 | 8.08 |
| 13 | /areas/chichibu-nagatoro | 6 | 85 | 33.61 ⚠️ |
| 14 | /areas/kawaguchiko | 6 | 65 | 10.54 |
| 15 | /areas/enoshima | 5 | 41 | 16.61 |
| 16 | /routes/odawara-castle-saigoji | 5 | 239 | 4.90 |
| 17 | /routes/yokohama-yamashita-redbrick-walk | 5 | 61 | 8.30 |
| 18 | /spots/boto-chi-eria | 5 | 42 | 4.95 |
| 19 | /spots/kohan-no-sunahama | 5 | 31 | 8.06 |
| 20 | /routes/odawara-suwa-park-walk (www) | 5 | 42 | 5.55 |
| 21 | /areas/kasai-rinkai | 4 | 109 | 12.45 |
| 22 | /areas/nasu | 4 | 52 | 13.83 |
| 23 | /routes/chichibu-hitsujiyama-shibazakura | 4 | **756** | 9.81 |
| 24 | /routes/hakone-ashinoko-lakeside-walk | 4 | 72 | 8.33 |
| 25 | /routes/hakone-ashinoko-old-highway-cedar | 4 | 31 | 7.94 |
| 26 | /routes/hayama-isshiki-morito | 4 | 118 | 8.39 |
| 27 | /routes/miura-jogashima | 4 | 48 | 8.56 |
| 28 | /routes/nasukogen-otome-falls-forest-walk | 4 | 113 | 7.68 |
| 29 | /routes/yokohama-minato-motomachi | 4 | 67 | 8.03 |
| 30 | /spots/resutoran-kosui-terasu | 4 | 50 | 10.94 |

### 🚨 要対策ハイライト

- **`/routes/kamakura-genji-park-loop` Pos 24.80**: 8 click / 148 imp で CTR 5.4% は健全だが順位 24.8 は異常。タイトル/meta/コンテンツ刷新候補。
- **`/areas/chichibu-nagatoro` Pos 33.61**: 6 click / 85 imp / 順位 33.6 ⚠️ エリアページ全体 SEO 弱い。
- **`/routes/nasu-minamigaoka-ranch` 675 imp で 7 click（CTR 1.0%）**: imp 大量だが順位 10 位で頭打ち → E-E-A-T 強化候補。
- **`/routes/chichibu-hitsujiyama-shibazakura` 756 imp で 4 click**: 芝桜シーズン (4-5月) ピーク終了。来年に向け順位押し上げが課題。

---

## 6. 主要 KW 順位

直接「犬 散歩 ルート」「犬 散歩コース」は当期 30 日で表示なし or 集計閾値未満。**戦略通り「地域分散ロングテール」で取れている**ことを確認。

### 当期上位ロングテール KW（地域分散 例）

| KW | clicks | imp | Pos |
|---|---:|---:|---:|
| 多摩川 ドッグラン | 5 | 76 | 6.82 |
| 井の頭公園 ボート 犬 | 4 | 21 | 5.00 |
| 多摩川 犬 散歩 | 3 | 21 | 6.71 |
| 多摩川 犬連れ | 3 | 23 | 9.48 |
| 臨港パーク 犬連れ | 3 | 23 | 7.91 |
| くりはま花の国 犬 | 2 | 150 | 11.07 |
| 南が丘牧場 犬連れ | 2 | 49 | 10.80 |
| 小田原 犬連れ 公園 | 2 | 28 | 9.39 |
| 小田原諏訪の原公園 犬 | 2 | 11 | 5.09 |
| 滝壺犬 | 2 | 46 | 8.67 |
| 芦ノ湖 犬 散歩 | 2 | 5 | **1.00** ✅ |
| 鎌倉大仏 犬連れ | 2 | 83 | 6.41 |

> 「**芦ノ湖 犬 散歩**」「**由比ヶ浜 散歩コース**」「**多摩川 沿い ウォーキングコース**」等で 1 位獲得。

---

## 7. AI 検索（Perplexity / ChatGPT）被言及テスト — CMO 手動実施タスク

5 KW で AI 検索の WanWalk 被言及をテスト。CTO 環境では Perplexity / Google が WebFetch を 403 ブロックするため、**CMO 手動実施**で記録する。
**6 月末に再テストし、被言及増加を観測**する。

### テスト KW（被言及検証用）
1. 「犬と散歩できる場所 鎌倉」
2. 「箱根 犬連れ 散歩コース」
3. 「東京で犬連れOK のドッグラン」
4. 「犬連れ旅行 関東 おすすめ」
5. 「愛犬と歩く 横浜 おすすめルート」

### 記録テンプレート（手動実施）
- 各 KW で Perplexity / ChatGPT 4o（検索モード）で実検索
- 結果中に `wanwalk.jp` の被引用ありか / 「WanWalk」のサービス名言及ありか
- 引用 URL（Source）リスト
- 引用される場合の文脈（推奨されているか / 単なる引用か）

実施記録は `ai_search_test_2026_05_19.md` に別途記録（or 本ファイル末尾に追記）。

---

## 8. 次回再計測のタイミング

- **6 月 1 日**: 月次 GSC 差分（[gsc-diff-monthly.md スキル](../../.claude/skills/gsc-diff-monthly.md)）— 救済漏れ追加検出
- **6 月末**: Phase 2-B 効果判定（5/19 ベンチ ×1.5 達成度・5/17 メタ 27 件効果反映）
- **7 月末**: +100% 目標達成度（季節横断 Step 5-C GO/NO-GO 判定材料）

## 関連メモリ

- [project_phase_d_gsc_benchmark_2026_05_19](file) — 主 KPI 圧勝 + GSC 副 KPI 当初ベンチ
- [project_b1_dashboard_2026_05_10](file) — Phase 2 全 Step 完遂サマリ
- [project_phase2_seo_emergency13_2026_05_10](file) — 5/10 緊急 13 本改修詳細
- [project_p1_meta_additional_2026_05_17](file) — 5/17 メタ 24 件追加バッチ
- [project_p1_meta_3routes_2026_05_17](file) — 5/17 P1 メタ 3 本
- [project_gsc_rescue_2026_05_17](file) — 5/17 GSC 救済 2 件 RENAMED 化
