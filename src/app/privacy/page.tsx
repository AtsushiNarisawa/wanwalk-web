import type { Metadata } from "next";
import Link from "next/link";

// 完全静的ページ（DB参照なし）
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "WanWalkのプライバシーポリシーです。取得する情報、利用目的、第三者提供、GPS位置情報の取り扱い等について定めています。",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* パンくず */}
      <nav
        style={{
          fontSize: 13,
          color: "var(--color-ww-text-tertiary)",
          marginBottom: 32,
        }}
      >
        <Link href="/" style={{ color: "inherit" }}>
          トップ
        </Link>
        <span style={{ margin: "0 8px" }}>/</span>
        <span style={{ color: "var(--color-ww-text-secondary)" }}>
          プライバシーポリシー
        </span>
      </nav>

      <h1
        className="ww-serif"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 36,
          fontWeight: 700,
          color: "var(--color-ww-text)",
          letterSpacing: "0.01em",
          lineHeight: 1.35,
          marginBottom: 12,
        }}
      >
        WanWalk プライバシーポリシー
      </h1>

      <p
        style={{
          fontSize: 13,
          color: "var(--color-ww-text-tertiary)",
          marginBottom: 40,
        }}
      >
        最終更新日: 2026年4月20日
      </p>

      <Section
        title="1. 運営事業者"
        body={
          <>
            <p>WanWalk（以下「本サービス」）は、以下の事業者が運営しています。</p>
            <ul>
              <li>屋号: DogHub</li>
              <li>代表: 成澤元子</li>
              <li>事業形態: 個人事業主</li>
              <li>所在地: 神奈川県足柄下郡箱根町仙石原</li>
              <li>
                お問い合わせ:{" "}
                <a
                  href="mailto:info@dog-hub.shop"
                  style={{ color: "var(--color-ww-accent)", textDecoration: "underline" }}
                >
                  info@dog-hub.shop
                </a>
              </li>
            </ul>
          </>
        }
      />

      <Section
        title="2. 取得する情報"
        body={
          <>
            <p>本サービスの提供にあたり、以下の情報を取得します。</p>
            <ul>
              <li>メールアドレス・ユーザー名・プロフィール情報</li>
              <li>愛犬情報（名前・犬種・年齢等／任意）</li>
              <li>GPS位置情報（散歩記録中のみ）</li>
              <li>散歩ルートデータ（距離・時間・軌跡）</li>
              <li>ユーザーが投稿した写真・コメント・ピン</li>
              <li>デバイス情報（OS種別・機種名・アプリバージョン）</li>
              <li>広告識別子（IDFA等。ATT許可時のみ）</li>
              <li>利用状況データ（アクセス日時・画面遷移履歴）</li>
            </ul>
          </>
        }
      />

      <Section
        title="3. 利用目的"
        body={
          <>
            <p>取得した情報は以下の目的で利用します。</p>
            <ol>
              <li>本サービスの提供・運営・改善</li>
              <li>散歩ルート・ピンの記録と表示</li>
              <li>ユーザーからのお問い合わせへの対応</li>
              <li>新機能・重要なお知らせの通知</li>
              <li>利用規約違反の調査・対応</li>
              <li>匿名化された統計情報の作成（利用分析）</li>
              <li>その他、上記に付随する目的</li>
            </ol>
          </>
        }
      />

      <Section
        title="4. 第三者提供"
        body={
          <>
            <p>
              次の場合を除き、あらかじめ本人の同意を得ることなく個人情報を第三者に提供しません。
            </p>
            <ul>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護のために必要であり、本人の同意を得ることが困難なとき</li>
              <li>
                公衆衛生・児童の健全育成のために特に必要があり、本人の同意を得ることが困難なとき
              </li>
              <li>国・地方公共団体等の法令事務の遂行に協力する必要があるとき</li>
            </ul>
          </>
        }
      />

      <Section
        title="5. 利用する第三者サービス（SDK等）"
        body={
          <>
            <p>
              本サービスは以下の外部サービスを利用しています。各サービスの取扱いは各社のプライバシーポリシーに従います。
            </p>
            <ul>
              <li>Supabase（データベース・認証） — 米国</li>
              <li>Apple Sign in with Apple（認証）</li>
              <li>Google Sign-In（認証）</li>
              <li>OpenStreetMap（地図タイル）</li>
              <li>Google Places API（スポット情報・写真取得）</li>
              <li>Apple Push Notification service（プッシュ通知）</li>
            </ul>
            <p>
              一部の情報は上記サービスの所在国（米国等）のサーバーで処理される場合があります。
            </p>
          </>
        }
      />

      <Section
        title="6. GPS位置情報の取り扱い"
        body={
          <>
            <p>散歩記録機能のため、位置情報を取得します。</p>
            <ul>
              <li>位置情報は、ユーザーが明示的に記録を開始した場合のみ取得・保存します</li>
              <li>バックグラウンド追跡は、散歩記録中のみ行います</li>
              <li>非公開設定にした記録は他のユーザーには表示されません</li>
              <li>位置情報の取得は、OSの設定からいつでも停止できます</li>
              <li>保存済みの記録はアプリ内から削除できます</li>
            </ul>
          </>
        }
      />

      <Section
        title="7. 写真・画像の取り扱い"
        body={
          <>
            <p>投稿される写真・画像について以下にご注意ください。</p>
            <ul>
              <li>投稿された写真は、ルート・ピンと共に他のユーザーに公開される場合があります</li>
              <li>
                写真に含まれるExif情報（撮影日時・位置情報）は、投稿前に自動的に削除または匿名化します
              </li>
              <li>他者が写り込んでいる写真を投稿する際は、必ずご本人の同意を得てください（肖像権）</li>
              <li>著作権を侵害する写真の投稿は禁止します</li>
              <li>不適切と判断した写真は、当方の判断で削除することがあります</li>
            </ul>
          </>
        }
      />

      <Section
        title="8. トラッキングと広告識別子（ATT）"
        body={
          <>
            <p>
              iOS の App Tracking Transparency（ATT）により、他社アプリ・Webサイトをまたいだトラッキングを行う前に、ユーザーの許可を取得します。
            </p>
            <ul>
              <li>現時点では本サービスはクロスアプリ・トラッキングを行っていません</li>
              <li>広告配信・行動履歴に基づくパーソナライゼーションは行っていません</li>
              <li>
                将来的に広告を導入する場合は、事前に本ポリシーを改訂し、アプリ内で通知します
              </li>
            </ul>
          </>
        }
      />

      <Section
        title="9. 情報の安全管理"
        body={
          <>
            <p>当方は、個人情報の漏えい・滅失・毀損の防止のため、以下の対策を講じます。</p>
            <ul>
              <li>HTTPS（TLS）による通信の暗号化</li>
              <li>Supabase Row Level Security（RLS）によるデータアクセス制御</li>
              <li>権限を持つ者以外がアクセスできない運用</li>
              <li>定期的なセキュリティレビュー</li>
            </ul>
          </>
        }
      />

      <Section
        title="10. 情報の開示・訂正・削除"
        body={
          <>
            <p>ご自身の情報について、以下の対応が可能です。</p>
            <ul>
              <li>プロフィール・愛犬情報: アプリ内「プロフィール」→「編集」から変更</li>
              <li>散歩記録・ピン・写真: アプリ内から個別に削除可能</li>
              <li>アカウント削除: アプリ内「設定」→「アカウントを削除」から実行</li>
              <li>
                アカウント削除後、個人情報は原則として速やかに削除します（法令で保存が義務付けられているものを除く）
              </li>
              <li>
                その他の開示・訂正請求は{" "}
                <a
                  href="mailto:info@dog-hub.shop"
                  style={{ color: "var(--color-ww-accent)", textDecoration: "underline" }}
                >
                  info@dog-hub.shop
                </a>{" "}
                へメールでご連絡ください（本人確認のため書類提出をお願いする場合があります）
              </li>
            </ul>
          </>
        }
      />

      <Section
        title="11. 未成年の利用について"
        body={
          <ul>
            <li>16歳未満の方が本サービスを利用する場合は、法定代理人（保護者）の同意を得てください</li>
            <li>13歳未満の方から意図的に個人情報を収集することはありません</li>
            <li>
              保護者の方で、お子様が同意なく情報を提供したとお気づきの場合は、
              <a
                href="mailto:info@dog-hub.shop"
                style={{ color: "var(--color-ww-accent)", textDecoration: "underline" }}
              >
                info@dog-hub.shop
              </a>{" "}
              までご連絡ください
            </li>
          </ul>
        }
      />

      <Section
        title="12. プライバシーポリシーの変更"
        body={
          <ul>
            <li>当方は必要に応じて本ポリシーを変更することがあります</li>
            <li>変更後の内容は本画面に掲載した時点から効力を生じます</li>
            <li>重要な変更がある場合は、アプリ内通知または起動時の告知でお知らせします</li>
            <li>変更後も本サービスを継続利用される場合、変更に同意したものとみなします</li>
          </ul>
        }
      />

      <Section
        title="13. お問い合わせ窓口"
        body={
          <>
            <p>本ポリシー・個人情報の取扱いに関するお問い合わせは下記までお願いします。</p>
            <ul>
              <li>サービス名: WanWalk</li>
              <li>運営: DogHub（代表 成澤元子）</li>
              <li>
                メール:{" "}
                <a
                  href="mailto:info@dog-hub.shop"
                  style={{ color: "var(--color-ww-accent)", textDecoration: "underline" }}
                >
                  info@dog-hub.shop
                </a>
              </li>
            </ul>
            <p style={{ fontSize: 13, color: "var(--color-ww-text-tertiary)" }}>
              ※回答までに数日いただく場合があります。
            </p>
          </>
        }
      />

      <Section
        title="14. 改訂履歴"
        body={
          <ul>
            <li>
              2026年4月20日: Build 31 Phase 2 改訂（運営事業者明記・連絡先更新・ATT章新設・第三者SDK開示・肖像権文言追加）
            </li>
            <li>2025年11月21日: 初版公開</li>
          </ul>
        }
      />

      <p
        style={{
          fontSize: 14,
          color: "var(--color-ww-text-tertiary)",
          textAlign: "center",
          marginTop: 48,
        }}
      >
        以上
      </p>
    </div>
  );
}

function Section({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        className="ww-serif"
        style={{
          fontFamily: "var(--font-ww-serif)",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--color-ww-accent)",
          marginBottom: 16,
          lineHeight: 1.5,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.9,
          color: "var(--color-ww-text)",
        }}
        className="ww-privacy-body"
      >
        {body}
      </div>
      <style>{`
        .ww-privacy-body p { margin-bottom: 12px; }
        .ww-privacy-body ul { margin: 8px 0 12px 0; padding-left: 24px; list-style: disc; }
        .ww-privacy-body ol { margin: 8px 0 12px 0; padding-left: 24px; list-style: decimal; }
        .ww-privacy-body li { margin-bottom: 6px; line-height: 1.8; }
      `}</style>
    </section>
  );
}
