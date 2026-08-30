"use client";

/**
 * /hakone「箱根エリアマップ」のクライアント親。
 *
 * ■ 二層構造（2026-08-30 設計変更）
 *   下層 = **API キー不要の Google マップ埋め込み（iframe・output=embed）**。SSR の HTML に
 *          常に入っており、課金ゼロ。
 *   上層 = **Maps JS API のピン付き地図**。ビューポートに入ってから読み込み、タイルを
 *          描き終えた時点で下層と入れ替える。
 *
 *   なぜこうするか: 以前は「ビューポートに入るまで何も出さない」設計にしていたため、
 *   スクロールしない訪問者・クローラ・IntersectionObserver が発火しない環境には
 *   **Google マップが1枚も無いページ**が配信されていた。/hakone は RouteCard の
 *   サムネが Google Places 由来なので、これは許諾条件 C5（Google由来写真を出す画面に
 *   Google マップを同時表示）を無言で破る（2026-08-30 Preview 実測で発覚）。
 *   下層を常設にすれば、**どの瞬間・どの環境でも Google マップが必ず1枚在る**まま、
 *   Maps JS の従量課金は「実際に地図まで到達した人だけ」に保てる。
 *
 * ■ 上層が出ない条件（すべて下層がそのまま見え続ける＝ C5 は維持される）
 *   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` 未設定 / ピン0件
 *   - ビューポートに入っていない・IntersectionObserver が発火しない環境
 *   - スクリプト取得失敗・認証失敗（gm_authFailure）・初期化タイムアウト
 *
 * ■ レイアウトが飛ばないこと
 *   下層と上層は同じ枠（FRAME_HEIGHT_CLASS）の中に絶対配置で重ねる。入れ替えは
 *   同じ箱の中の描画切り替えなので、高さも位置も動かない。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapTrifold } from "@phosphor-icons/react";
import type { HakoneAreaPin } from "./HakoneAreaGoogleMap";

/** Maps JS API は SSR 非対応。HakoneDogMapView と同じく dynamic(ssr:false) で包む。 */
const HakoneAreaGoogleMap = dynamic(() => import("./HakoneAreaGoogleMap"), {
  ssr: false,
  // 読み込み中は何も出さない。下層の iframe がそのまま見えているので空白にならない。
  loading: () => null,
});

/**
 * 地図の枠の高さ。**下層の iframe と上層の JS 地図で共有**する（入れ替え時の跳ねを防ぐ）。
 *
 * デスクトップでは幅 1,152px に対して高さ 360px（3.2:1）だと、5エリア（南北 約7km・
 * 東西 約8km）を fitBounds したとき**高さが制約**になり、横方向は 30km超（御殿場〜
 * 小田原）まで映ってピンが中央に小さく固まった（2026-08-30 検分）。md 以上で背を高くして
 * 縦横比を緩め、`isFractionalZoomEnabled` と合わせて寄せる。
 *
 * 1152px 幅での試算（padding 36/36/52/36）:
 *   360px = zoom 12.0・表示 36.0km 幅（ピン占有 横22%）← 検分時の状態
 *   520px = zoom 12.97・表示 18.4km 幅（ピン占有 横44%）← 採用
 * これ以上高くしても寄りの改善は鈍り（600px でも横52%）、コース一覧が下へ押されるだけ。
 * モバイルは 360px のまま（幅が狭いぶん元から素直に収まっており、縦スクロールも圧迫しない）。
 */
const FRAME_HEIGHT_CLASS = "h-[360px] md:h-[520px]";

const LAYER_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

interface Props {
  pins: HakoneAreaPin[];
  /** NEXT_PUBLIC_GOOGLE_MAPS_API_KEY（未設定なら空文字＝下層の iframe のまま）。 */
  apiKey: string;
  caption: string;
  /** 下層 iframe と「Googleマップで開く」リンクの検索語。 */
  mapsQuery: string;
  /** 下層 iframe のズーム（ピンが無い簡易表示なので広め）。 */
  embedZoom?: number;
  /** 下層 iframe の title（アクセシビリティ）。 */
  embedTitle: string;
}

export default function HakoneAreaMapSection({
  pins,
  apiKey,
  caption,
  mapsQuery,
  embedZoom = 11,
  embedTitle,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  // ⚠️ 初期値はサーバ・クライアントで必ず同じ false にする。dynamic(ssr:false) は SSR 時に
  //    「クライアントで描き直す」境界を出力するため、初期値が環境で変わると hydration が
  //    ズレる（実測でエラーを踏んだ）。ビューポート判定は必ずマウント後の effect で行う。
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  /** 上層の JS 地図がタイルを描き終えたか。true になって初めて下層を外す。 */
  const [painted, setPainted] = useState(false);

  const canUseJsMap = apiKey.length > 0 && pins.length > 0 && !failed;
  const showJsMap = canUseJsMap && inView;
  const showEmbed = !(showJsMap && painted);

  // 子（地図本体）は「スクリプト取得失敗」「認証失敗（gm_authFailure）」「初期化タイムアウト」の
  // 3経路からこれを呼ぶ。identity を固定しないと子側の effect が毎レンダで張り直され、
  // タイムアウトが永久にリセットされてしまうため useCallback で安定させる。
  const handleLoadError = useCallback(() => {
    setFailed(true);
    setPainted(false);
  }, []);
  const handlePainted = useCallback(() => setPainted(true), []);

  useEffect(() => {
    if (!canUseJsMap || inView) return;
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
      // ほんの少しだけ手前で読み始める（到達してから差し替わるまでの間を詰める）。
      // 大きくしすぎると「ページを開いただけ」で Maps JS を読み込む＝課金が走るので、
      // 地図の frameTop（実測 約1,090px）より小さい値に留める。
      { rootMargin: "96px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [canUseJsMap, inView]);

  const embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    mapsQuery
  )}&z=${embedZoom}&hl=ja&output=embed`;
  const linkHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapsQuery
  )}`;

  return (
    <div>
      <div
        ref={frameRef}
        className={FRAME_HEIGHT_CLASS}
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "var(--radius-ww-md)",
          border: "1px solid var(--color-ww-border-subtle)",
          backgroundColor: "var(--color-ww-bg-secondary)",
        }}
      >
        {/* 下層: API キー不要の Google マップ埋め込み。SSR の HTML に常に入る。 */}
        {showEmbed && (
          <iframe
            title={embedTitle}
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ ...LAYER_STYLE, border: 0, display: "block" }}
          />
        )}

        {/* 上層: Maps JS のピン付き地図。描き終える（painted）まで透明のまま重ね、
            下層を隠さない。描き終えた時点で下層が外れ、見た目だけが入れ替わる。 */}
        {showJsMap && (
          <div
            style={{
              ...LAYER_STYLE,
              opacity: painted ? 1 : 0,
              pointerEvents: painted ? "auto" : "none",
            }}
          >
            <HakoneAreaGoogleMap
              pins={pins}
              apiKey={apiKey}
              onLoadError={handleLoadError}
              onPainted={handlePainted}
            />
          </div>
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
