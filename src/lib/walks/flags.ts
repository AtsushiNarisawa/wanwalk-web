/**
 * 箱根 2マップの相互回遊トグル・トップの箱根特集を制御する **UI 専用フラグ**。
 *
 * ⚠️ 最重要（CEO 直接指示・2026-07-24）:
 *   このフラグが制御するのは UI（/hakone と /hakone/dog-map のトグル表示、
 *   トップページの「おすすめピックアップ」枠を「箱根特集」へ差し替え）だけ。
 *   /hakone/dog-map 本体の公開可否とは一切配線しない。
 *
 *   ※ 2026-08-26 の A6/A7 で dog-map の公開ゲート（?k 必須・notFound()・noindex・
 *     sitemap 非掲載）は解除済み＝dog-map は公開ページになった。
 *     このフラグは引き続き UI 専用で、ON/OFF は dog-map の公開状態を変えない。
 *
 * OFF（env 未設定＝本番デフォルト・現状の見た目）:
 *   - /hakone に「犬連れスポット」への相互リンク（トグル）を出さない。
 *   - トップは従来の「おすすめピックアップ」のまま。
 * ON（Vercel env で NEXT_PUBLIC_HAKONE_CROSSLINK=true・コード変更不要）:
 *   - /hakone と /hakone/dog-map に2タブのトグル（散歩コース ⇄ 犬連れスポット）を表示。
 *   - トップの「おすすめピックアップ」枠を index 可能な /hakone を主 CTA にした
 *     「箱根特集」バンドへ差し替え（可逆・フラグを戻せば元に戻る）。
 *
 * ※ 旧名 NEXT_PUBLIC_HAKONE_DOGMAP_PUBLIC は「dog-map を公開する」と誤読されるため廃止し、
 *   UI 専用と分かる NEXT_PUBLIC_HAKONE_CROSSLINK に統一した。
 */
export const HAKONE_CROSSLINK_ENABLED =
  process.env.NEXT_PUBLIC_HAKONE_CROSSLINK === "true";
