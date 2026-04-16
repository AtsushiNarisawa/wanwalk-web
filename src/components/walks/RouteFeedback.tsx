"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_WANWALK_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_WANWALK_SUPABASE_ANON_KEY!
);

const categories: Record<string, string> = {
  parking: "駐車場",
  surface: "道の状態",
  water_station: "水飲み場",
  restroom: "トイレ",
  pet_facilities: "ペット施設",
  other: "その他",
};

export default function RouteFeedback({ routeId }: { routeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("other");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await supabase.from("route_feedback").insert({
        route_id: routeId,
        user_id: null,
        category,
        message: message.trim(),
      });
      setSubmitted(true);
      setMessage("");
    } catch {
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mb-10">
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "var(--color-ww-bg-secondary)" }}
      >
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-ww-text-secondary)" }}
        >
          このルートの情報は最新でない場合があります。
          お気づきの点があれば、ぜひ教えてください。
          みなさんの声でルート情報を一緒に育てていきます。
        </p>

        {submitted ? (
          <p
            className="mt-4 text-sm font-medium"
            style={{ color: "var(--color-ww-accent)" }}
          >
            ご報告ありがとうございます！確認後に反映します。
          </p>
        ) : !isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: "var(--color-ww-accent)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            情報の修正を提案する
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* カテゴリ */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-ww-text-secondary)" }}
              >
                カテゴリ
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categories).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className="px-3 py-1.5 text-xs border transition-colors"
                    style={{
                      borderRadius: "var(--radius-ww-sm)",
                      ...(category === key
                        ? {
                            backgroundColor: "var(--color-ww-accent-soft)",
                            borderColor: "var(--color-ww-accent)",
                            color: "var(--color-ww-accent)",
                            fontWeight: 500,
                          }
                        : {
                            backgroundColor: "var(--color-ww-bg)",
                            borderColor: "var(--color-ww-border-subtle)",
                            color: "var(--color-ww-text-secondary)",
                          }),
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* メッセージ */}
            <div>
              <label
                className="block text-xs font-medium mb-2"
                style={{ color: "var(--color-ww-text-secondary)" }}
              >
                修正内容
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="例: 駐車場は現在500円に値上がりしています"
                className="w-full px-3 py-2 text-sm resize-none"
                style={{
                  border: "1px solid var(--color-ww-border-subtle)",
                  borderRadius: "var(--radius-ww-md)",
                  outline: "none",
                  color: "var(--color-ww-text)",
                  backgroundColor: "var(--color-ww-bg)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-ww-accent)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-ww-border-subtle)";
                }}
              />
              <p
                className="text-right text-xs mt-1"
                style={{ color: "var(--color-ww-text-tertiary)" }}
              >
                {message.length}/500
              </p>
            </div>

            {/* ボタン */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-5 py-2 text-sm font-medium transition-colors disabled:opacity-40"
                style={{
                  backgroundColor: "var(--color-ww-accent)",
                  color: "var(--color-ww-text-inverse)",
                  borderRadius: "var(--radius-ww-md)",
                }}
              >
                {isSubmitting ? "送信中..." : "送信する"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm transition-colors"
                style={{ color: "var(--color-ww-text-tertiary)" }}
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
