import Link from "next/link";
import { SealCheck } from "@phosphor-icons/react/dist/ssr";
import { formatUpdatedYearMonth } from "@/lib/walks/structured-data";

// E-E-A-T「運営・編集」バイライン（2026-06-22 CEO 合意・B1/B2）。
//
// 検索流入が着地するページ（ルート/エリア/スポット）に「誰が運営・編集しているか」を可視化し、
// 量産アフィリエイトとの差別化＝信頼を見せる。
//
// 誠実性ルール（CEO 指示）: 公式ルートは物理的な踏破・現地確認をしていないため、
// 「実走」「現地確認」とは書かない。言えるのは「運営・編集者が実在すること」
// 「情報を見直して整備・更新していること」「最終更新がいつか（updated_at）」という事実のみ。

type Props = {
  /** official_routes.updated_at 等。あれば「最終更新 YYYY年M月」を表示。 */
  updatedAt?: string | null;
  /** 整備対象の説明（既定はルート向け）。エリア/スポットで文言を差し替える。 */
  scopeNote?: string;
};

export default function TrustByline({
  updatedAt,
  scopeNote = "犬連れ目線で、駐車場・路面・犬同伴ルールを一本ずつ見直して整備しています。",
}: Props) {
  const updated = formatUpdatedYearMonth(updatedAt);
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "14px 16px",
        backgroundColor: "var(--color-ww-bg-secondary)",
        border: "1px solid var(--color-ww-border-subtle)",
        borderRadius: "var(--radius-ww-md)",
      }}
    >
      <SealCheck
        size={20}
        weight="regular"
        style={{ color: "var(--color-ww-accent)", flexShrink: 0, marginTop: 2 }}
        aria-hidden
      />
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-ww-text)",
            lineHeight: 1.6,
          }}
        >
          運営・編集：DogHub（箱根仙石原 犬のホテル&カフェ）
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-ww-text-secondary)",
            lineHeight: 1.7,
            marginTop: 2,
          }}
        >
          {scopeNote}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--color-ww-text-tertiary)",
            lineHeight: 1.6,
            marginTop: 6,
          }}
        >
          {updated && <span>最終更新 {updated}</span>}
          {updated && <span style={{ margin: "0 8px" }}>・</span>}
          <Link
            href="/about"
            style={{ color: "var(--color-ww-accent)", fontWeight: 500 }}
          >
            運営情報を見る
          </Link>
        </p>
      </div>
    </div>
  );
}
