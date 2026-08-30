"use client";

/**
 * /hakone「箱根エリアマップ」のクライアント親。
 *
 * 役割は3つ:
 *   1. **遅延読み込み**: IntersectionObserver でビューポート到達を待ってから
 *      Maps JS API（従量課金）を読み込む。ページを開いただけでは課金されない。
 *   2. **フォールバック**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 未設定・ピン0件・
 *      Maps JS の読み込み失敗（キー失効／リファラ制限）のいずれでも、
 *      従来の GoogleMapEmbed（API キー不要の iframe 埋め込み）へ落ちる。
 *      → **Google由来写真の画面に Googleマップが必ず1枚ある**（許諾条件 C5）が壊れない。
 *   3. キャプションと「Googleマップで開く」外部リンクの維持（出所表示）。
 *
 * フォールバックは server component（GoogleMapEmbed）の描画結果を `fallback` prop で
 * 受け取る。こちらのバンドルへ引き込まないための作法。
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MapTrifold } from "@phosphor-icons/react";
import type { HakoneAreaPin } from "./HakoneAreaGoogleMap";

/** Maps JS API は SSR 非対応。HakoneDogMapView と同じく dynamic(ssr:false) で包む。 */
const HakoneAreaGoogleMap = dynamic(() => import("./HakoneAreaGoogleMap"), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        backgroundColor: "var(--color-ww-bg-secondary)",
        color: "var(--color-ww-text-tertiary)",
        fontSize: 13,
      }}
    >
      地図を読み込み中...
    </div>
  );
}

interface Props {
  pins: HakoneAreaPin[];
  /** NEXT_PUBLIC_GOOGLE_MAPS_API_KEY（未設定なら空文字＝フォールバック）。 */
  apiKey: string;
  height?: number;
  caption: string;
  /** 「Googleマップで開く」外部リンクの検索語。 */
  mapsQuery: string;
  /** キーが無い／読み込めないときに出す従来の iframe 埋め込み。 */
  fallback: ReactNode;
}

export default function HakoneAreaMapSection({
  pins,
  apiKey,
  height = 360,
  caption,
  mapsQuery,
  fallback,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  // ⚠️ 初期値はサーバ・クライアントで必ず同じ false にする。dynamic(ssr:false) は SSR 時に
  //    「クライアントで描き直す」境界を出力するため、初期値が環境で変わると hydration が
  //    ズレる（実測でエラーを踏んだ）。ビューポート判定は必ずマウント後の effect で行う。
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);

  const usable = apiKey.length > 0 && pins.length > 0 && !failed;

  useEffect(() => {
    if (!usable || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      // 遅延できない環境（極めて古いブラウザ）は「地図が永久に出ない」より
      // 「そのまま読み込む」に倒す。effect 本体での同期 setState は避ける。
      const t = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(t);
    }
    const el = frameRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // ほんの少しだけ手前で読み始める（到達してから真っ白にならないように）。
      // 大きくしすぎると「ページを開いただけ」で Maps JS を読み込む＝課金が走るので、
      // 地図の frameTop（実測 約1,090px）より小さい値に留める。
      { rootMargin: "96px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [usable, inView]);

  if (!usable) return <>{fallback}</>;

  const linkHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`;

  return (
    <div>
      <div
        ref={frameRef}
        style={{
          position: "relative",
          height,
          overflow: "hidden",
          borderRadius: "var(--radius-ww-md)",
          border: "1px solid var(--color-ww-border-subtle)",
          backgroundColor: "var(--color-ww-bg-secondary)",
        }}
      >
        {inView ? (
          <HakoneAreaGoogleMap
            pins={pins}
            apiKey={apiKey}
            height={height}
            onLoadError={() => setFailed(true)}
          />
        ) : (
          <MapPlaceholder />
        )}
      </div>
      <p
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "var(--color-ww-text-tertiary)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <MapTrifold size={14} weight="regular" aria-hidden />
        {caption}
        <a
          href={linkHref}
          target="_blank"
          rel="noopener"
          style={{ color: "var(--color-ww-accent)" }}
        >
          Googleマップで開く
        </a>
      </p>
    </div>
  );
}
