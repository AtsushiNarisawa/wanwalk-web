"use client";

/**
 * /hakone「箱根エリアマップ」の地図本体（Google Maps JavaScript API）。
 *
 * 目的（HAKONE_DMO_SPRINT_CTO_SPEC C5・案A）:
 *   Google Places 由来のサムネを出す /hakone に Googleマップを併設する許諾条件を満たしつつ、
 *   「箱根◯エリアの位置」というキャプションどおり**エリアのピンを実際に描く**。
 *   （旧実装は output=embed の簡易 iframe で、ピンを打てなかった）
 *
 * 設計:
 *   - 親（HakoneAreaMapSection）が IntersectionObserver でビューポート到達を待ってから
 *     dynamic import する。ページを開いただけでは Maps JS を読み込まない＝従量課金を抑える。
 *   - ピンは「ページが実際に描画しているエリア」から生成される（親が算出）。固定5件ではない。
 *   - カメラは fitBounds で全ピンが収まるよう自動計算（固定 zoom の決め打ちはしない）。
 *     DESIGN_TOKENS 12-A「map.padding=40 / coordinates が1点以上あれば fitBounds」に準拠。
 *   - マーカーは Google 既定の赤い雫を使わず、OverlayView で WanWalk トーンの
 *     「深緑ドット＋エリア名ラベル」を描く（DESIGN_TOKENS: accent #6B7F5B・白縁・影なし）。
 *     ラベルを出すのは、ピンだけでは「どれがどのエリアか」が伝わらないため。
 *   - ⚠️ Google のロゴ・帰属表示（attribution）は隠さない・改変しない（利用規約・許諾条件）。
 *     隠しているのは mapType / StreetView / 全画面ボタンだけで、著作権表示には触れない。
 */
import { useCallback, useEffect, useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  OverlayViewF,
  OVERLAY_MOUSE_TARGET,
  useJsApiLoader,
} from "@react-google-maps/api";
import { ArrowRight } from "@phosphor-icons/react";

export interface HakoneAreaPin {
  slug: string;
  /** エリア名（例「箱根・強羅」）。InfoWindow はこの正式名を出す。 */
  name: string;
  lat: number;
  lng: number;
  /** そのエリアの公開ルート数。 */
  routeCount: number;
  /** クリック時の遷移先（ページ内アンカー）。 */
  href: string;
}

/** 全ピンが収まる初期表示の余白（px）。上下はラベル分だけ広めに取る。 */
const FIT_PADDING: google.maps.Padding = {
  top: 56,
  right: 40,
  bottom: 56,
  left: 40,
};
/** ピンが1件しかないときの単点表示 zoom（DESIGN_TOKENS: map.fallbackZoom 相当）。 */
const SINGLE_PIN_ZOOM = 13;
/** マーカーのドット直径（px）。 */
const DOT_SIZE = 14;

/**
 * 初期 center は施設・ルート分布に依存させず箱根の中心で固定する
 * （HakoneDogMap と同じ中立性の作法。全域フィットは onLoad の fitBounds が担う）。
 */
const NEUTRAL_CENTER: google.maps.LatLngLiteral = { lat: 35.232, lng: 139.05 };

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  // Google 側の POI アイコンをクリック不可に（自前の InfoWindow と競合させない）。
  clickableIcons: false,
  // スマホで1本指スクロールがマップに吸われないようにする（375px でも縦スクロールが通る）。
  gestureHandling: "cooperative",
  maxZoom: 16,
};

/** マップ上のラベルは「箱根・」の接頭辞を落として短くする（地図全体が箱根なので冗長）。 */
function shortLabel(name: string): string {
  return name.replace(/^箱根・/, "");
}

interface Props {
  pins: HakoneAreaPin[];
  apiKey: string;
  height: number;
  /** Maps JS の読み込みに失敗したとき（キー失効・リファラ制限等）に親へ知らせる。 */
  onLoadError: () => void;
}

export default function HakoneAreaGoogleMap({
  pins,
  apiKey,
  height,
  onLoadError,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "wanwalk-hakone-area-map",
    googleMapsApiKey: apiKey,
    language: "ja",
    region: "JP",
  });

  useEffect(() => {
    if (loadError) onLoadError();
  }, [loadError, onLoadError]);

  const handleLoad = useCallback(
    (map: google.maps.Map) => {
      if (pins.length === 0) return;
      if (pins.length === 1) {
        map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
        map.setZoom(SINGLE_PIN_ZOOM);
        return;
      }
      const bounds = new google.maps.LatLngBounds();
      pins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, FIT_PADDING);
    },
    [pins]
  );

  if (loadError) return null; // フォールバック（iframe 埋め込み）は親が出す。

  if (!isLoaded) {
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

  const selectedPin = pins.find((p) => p.slug === selected) ?? null;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: `${height}px` }}
      center={NEUTRAL_CENTER}
      zoom={11}
      options={MAP_OPTIONS}
      onLoad={handleLoad}
      onClick={() => setSelected(null)}
    >
      {pins.map((pin) => {
        const isSelected = pin.slug === selected;
        return (
          <OverlayViewF
            key={pin.slug}
            position={{ lat: pin.lat, lng: pin.lng }}
            mapPaneName={OVERLAY_MOUSE_TARGET}
            zIndex={isSelected ? 2 : 1}
            // 要素の「ドット中心」が座標に重なるように左右中央・上方向へずらす。
            getPixelPositionOffset={(width) => ({
              x: -(width / 2),
              y: -(DOT_SIZE / 2),
            })}
          >
            <button
              type="button"
              aria-label={`${pin.name}（${pin.routeCount}コース）`}
              onClick={() => setSelected(pin.slug)}
              style={{
                appearance: "none",
                border: 0,
                background: "transparent",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: DOT_SIZE,
                  height: DOT_SIZE,
                  borderRadius: 9999,
                  backgroundColor: isSelected
                    ? "var(--color-ww-accent-hover)"
                    : "var(--color-ww-accent)",
                  border: "2px solid #FFFFFF",
                  // 白地・緑地どちらの上でも輪郭が消えないための髪の毛1本の輪郭。
                  // HakoneDogMap のマーカーと同じ作法（装飾の影ではない）。
                  boxShadow: "0 0 0 1px rgba(42,42,42,0.16)",
                  display: "block",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-ww-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "var(--color-ww-text)",
                  backgroundColor: "rgba(255,255,255,0.94)",
                  border: "1px solid var(--color-ww-border-subtle)",
                  borderRadius: "var(--radius-ww-sm)",
                  padding: "2px 6px",
                }}
              >
                {shortLabel(pin.name)}
              </span>
            </button>
          </OverlayViewF>
        );
      })}

      {selectedPin && (
        <InfoWindowF
          position={{ lat: selectedPin.lat, lng: selectedPin.lng }}
          onCloseClick={() => setSelected(null)}
          options={{
            pixelOffset: new google.maps.Size(0, -DOT_SIZE / 2),
            maxWidth: 240,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-ww-sans)",
              minWidth: 150,
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-ww-text)",
                marginBottom: 2,
              }}
            >
              {selectedPin.name}
            </div>
            <div
              className="ww-numeric"
              style={{
                fontSize: 12,
                color: "var(--color-ww-text-secondary)",
                marginBottom: 8,
              }}
            >
              {selectedPin.routeCount}コース
            </div>
            <a
              href={selectedPin.href}
              onClick={() => setSelected(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 500,
                color: "var(--color-ww-accent)",
                textDecoration: "none",
              }}
            >
              このエリアのコースを見る
              <ArrowRight size={13} weight="regular" aria-hidden />
            </a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}
