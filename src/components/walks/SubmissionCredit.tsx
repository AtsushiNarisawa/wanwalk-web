import { HandHeart, SealCheck } from "@phosphor-icons/react/dist/ssr";

// 投稿ルート（origin='submission'）の出所クレジット＋確認レベルバッジ（A-2 二部構成・決定8/23）。
//
// 設計方針:
// - 出所クレジット: 守り人表示に同意（guardian_opt_in）していれば「この道の守り人：◯◯さん」、
//   未同意なら名前を出さず「読者の推薦から生まれた道」とだけ示す（退会・匿名配慮／決定6・23）。
// - 確認レベルバッジ: admin が掲載時に選ぶ confidence_level を人間可読ラベル＋誠実な注記で見せる。
//   「現地の再訪はしていません」を明言する誠実性ルール（決定8 背景）に沿い、机上確認は言い切らない。
// - 掲載記事は編集部の著作。投稿者の言葉・編集部の追記は初回掲載の実データが出てから育てる（決定18）。

const CONFIDENCE_LABELS: Record<string, string> = {
  desk_checked: "机上確認",
  walked_reported: "実走報告あり",
  field_verified: "現地確認済み",
};

const CONFIDENCE_NOTES: Record<string, string> = {
  desk_checked:
    "編集部が資料・地図で確認して掲載しています（編集部による現地の再訪はしていません）。",
  walked_reported:
    "実際に歩いた方の報告をもとに掲載しています（編集部による現地の再訪はしていません）。",
  field_verified: "編集部が現地で確認して掲載しています。",
};

type Props = {
  submitterName?: string | null;
  guardianOptIn?: boolean;
  confidenceLevel?: string | null;
};

export default function SubmissionCredit({
  submitterName,
  guardianOptIn,
  confidenceLevel,
}: Props) {
  const hasGuardian = Boolean(guardianOptIn && submitterName);
  const confLabel = confidenceLevel
    ? CONFIDENCE_LABELS[confidenceLevel] ?? confidenceLevel
    : null;
  const confNote = confidenceLevel ? CONFIDENCE_NOTES[confidenceLevel] : null;

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
      <HandHeart
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
          {hasGuardian
            ? `この道の守り人：${submitterName}さん`
            : "読者の推薦から生まれた道"}
        </p>
        <p
          style={{
            fontSize: 13,
            color: "var(--color-ww-text-secondary)",
            lineHeight: 1.7,
            marginTop: 2,
          }}
        >
          実際に愛犬と歩いた方の推薦を、WanWalk編集部が確認して掲載しています。
        </p>
        {confLabel && (
          <p
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              color: "var(--color-ww-accent)",
              backgroundColor: "var(--color-ww-bg)",
              border: "1px solid var(--color-ww-border-subtle)",
              borderRadius: "9999px",
              padding: "4px 10px",
              marginTop: 8,
            }}
          >
            <SealCheck size={14} weight="regular" aria-hidden />
            {confLabel}
          </p>
        )}
        {confNote && (
          <p
            style={{
              fontSize: 12,
              color: "var(--color-ww-text-tertiary)",
              lineHeight: 1.6,
              marginTop: 6,
            }}
          >
            {confNote}
          </p>
        )}
      </div>
    </div>
  );
}
