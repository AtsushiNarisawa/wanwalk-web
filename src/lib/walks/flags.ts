/**
 * 箱根 2マップの相互回遊トグル・トップの箱根特集を制御する **UI 専用フラグ**。
 *
 * ⚠️ 最重要（CEO 直接指示・2026-07-24）:
 *   このフラグが制御するのは UI（/hakone と /hakone/dog-map のトグル表示、
 *   トップページの「おすすめピックアップ」枠を「箱根特集」へ差し替え）だけ。
 *   /hakone/dog-map 本体の公開ゲート（?k 必須・notFound()・robots noindex・sitemap 非掲載）
 *   とは一切配線しない。フラグを true にしても、?k 無しの /hakone/dog-map は
 *   依然 404＋noindex のまま＝**dog-map は公開されない**。
 *   dog-map の一般公開は別途 A6/A7（?k 解除・noindex 解除・sitemap 追加）で行う。
 *   リリース時は「フラグ ON」と「A6/A7」を一緒に切り替えるが、フラグ単体では公開されない。
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
