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
 *   - マーカーは Google 既定の赤い雫を使わず、OverlayView で WanWalk トーンの
 *     「深緑ピン＋エリア名ラベル」を描く（DESIGN_TOKENS: accent #6B7F5B・白縁・影なし）。
 *     ラベルを出すのは、ピンだけでは「どれがどのエリアか」が伝わらないため。
 *   - Google 既定の POI（美術館・神社・山名）は styles で伏せる。5エリアの位置を示すという
 *     この地図の唯一の目的が、色付き POI アイコンに埋もれていたため（2026-08-30 検分）。
 *   - ⚠️ Google のロゴ・帰属表示（「地図データ ©」「利用規約」）は隠さない・改変しない
 *     （利用規約・許諾条件）。伏せたのは POI レイヤーと mapType / StreetView / 全画面ボタンだけ。
 */
import { useCallback, useEffect, useState } from "react";
import {
  GoogleMap,
  InfoWindowF,
  OverlayViewF,
  OVERLAY_MOUSE_TARGET,
  useJsApiLoader,
} from "@react-google-maps/api";
import { ArrowRight, MapPin } from "@phosphor-icons/react";

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

/**
 * 全ピンが収まる初期表示の余白（px）。ラベルはピンの下に伸びるので bottom を厚めに取る。
 * 過大にすると fitBounds が引きすぎるので必要最小限にとどめる。
 */
const FIT_PADDING: google.maps.Padding = {
  top: 36,
  right: 36,
  bottom: 52,
  left: 36,
};
/** ピンが1件しかないときの単点表示 zoom（DESIGN_TOKENS: map.fallbackZoom 相当）。 */
const SINGLE_PIN_ZOOM = 13;
/** マーカー（丸ピン）の直径と中のグリフ寸法（DESIGN_TOKENS 12-A のマーカー規格）。 */
const PIN_SIZE = 26;
const PIN_GLYPH = 14;

/**
 * Maps JS が初期化されないまま放置される時間の上限（ms）。
 * スクリプト取得は成功したのに google.maps が生えてこない状態（回線のスタール・
 * 拡張機能や CSP によるブロック等）を拾い、黙って空箱にせず iframe へ倒すための保険。
 * `isLoaded` が立った時点で解除するので、タイル描画が遅いだけでは発火しない。
 */
const INIT_TIMEOUT_MS = 10_000;

declare global {
  interface Window {
    /**
     * Maps JS API が**認証に失敗したとき**に呼ぶコールバック（Google 側の仕様）。
     * RefererNotAllowedMapError / InvalidKeyMapError / BillingNotEnabledMapError /
     * ApiNotActivatedMapError / ExpiredKeyMapError などはすべてここに来る。
     */
    gm_authFailure?: () => void;
  }
}

/**
 * 初期 center は施設・ルート分布に依存させず箱根の中心で固定する
 * （HakoneDogMap と同じ中立性の作法。全域フィットは onLoad の fitBounds が担う）。
 */
const NEUTRAL_CENTER: google.maps.LatLngLiteral = { lat: 35.232, lng: 139.05 };

/**
 * 地図のスタイル。**POI レイヤーだけを伏せる**。
 * 地形・道路・地名（市区町村名）は情報として残す。Google のロゴ・著作権表示・
 * 「利用規約」リンクは styles では制御できず、こちらも一切触っていない。
 */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  // 美術館・神社・山名などの色付きアイコンとラベル。これが我々の5ピンより目立っていた。
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  // 駅・バス停のアイコン（路線そのものは残す＝箱根登山鉄道は文脈として有用）。
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  // Google 側の POI アイコンをクリック不可に（自前の InfoWindow と競合させない）。
  clickableIcons: false,
  // スマホで1本指スクロールがマップに吸われないようにする（375px でも縦スクロールが通る）。
  gestureHandling: "cooperative",
  maxZoom: 16,
  // 整数ズームだと fitBounds が必ず1段引きすぎる。5エリア（東西約8km）に対して
  // 30km超（御殿場〜小田原）を映してしまっていたため、小数ズームを許可して寄せる。
  isFractionalZoomEnabled: true,
  styles: MAP_STYLES,
};

/** マップ上のラベルは「箱根・」の接頭辞を落として短くする（地図全体が箱根なので冗長）。 */
function shortLabel(name: string): string {
  return name.replace(/^箱根・/, "");
}

interface Props {
  pins: HakoneAreaPin[];
  apiKey: string;
  /** Maps JS の読み込み・認証に失敗したときに親へ知らせる（親が下層の iframe を残す）。 */
  onLoadError: () => void;
  /**
   * タイルを描き終えたときに親へ知らせる。親はこれを受けて初めて下層の iframe を外す。
   * 認証に失敗した場合 tilesloaded は発火しないので、下層が外れることはない。
   */
  onPainted: () => void;
}

export default function HakoneAreaGoogleMap({
  pins,
  apiKey,
  onLoadError,
  onPainted,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // 🔴 この effect は useJsApiLoader より**前**に宣言する。effect は宣言順に走るので、
  //    こうしておけば Maps JS の <script> が差し込まれるより先にハンドラが載る。
  //
  //    なぜ必要か: `useJsApiLoader` の `loadError` は**スクリプトの取得に失敗したとき
  //    しか発火しない**。キーの拒否（リファラ制限・キー失効・請求停止・API 未有効化）は
  //    スクリプト自体は正常に読めた"あと"に認証が落ちるため loadError は false のままで、
  //    地図コンテナには Google の灰色エラー UI だけが残る。これを掴まないと
  //    「/hakone から Google マップが黙って消える」＝許諾条件 C5 が無言で破れる
  //    （2026-08-30 Preview 実測で発生）。認証失敗は gm_authFailure で拾うしかない。
  useEffect(() => {
    const previous = window.gm_authFailure;
    const handler = () => {
      // 他所で定義済みの実装があれば奪わずに連鎖させる。
      previous?.();
      onLoadError();
    };
    window.gm_authFailure = handler;
    return () => {
      // 自分が入れたものだけ元に戻す（別の実装に差し替わっていたら触らない）。
      if (window.gm_authFailure === handler) window.gm_authFailure = previous;
    };
  }, [onLoadError]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "wanwalk-hakone-area-map",
    googleMapsApiKey: apiKey,
    language: "ja",
    region: "JP",
  });

  // 経路1: スクリプトそのものの取得失敗。
  useEffect(() => {
    if (loadError) onLoadError();
  }, [loadError, onLoadError]);

  // 経路3: 読み込みが一定時間まったく進まないとき（保険）。
  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(onLoadError, INIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, onLoadError]);

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

  /**
   * ピンの選択。
   *
   * 🔴 stopPropagation が要る: overlayMouseTarget ペインの DOM クリックは、そのまま
   *    地図コンテナまで泡立って Google の map click として解釈される。以前は
   *    `<GoogleMap onClick={() => setSelected(null)}>` を置いていたため、
   *    setSelected(slug) の直後に同じレンダーで null に打ち消され、**InfoWindow が
   *    永久に開かなかった**（2026-08-30 Preview 検分で発覚）。地図側の onClick は
   *    撤去したうえで、泡立ち自体もここで止める（地図のドラッグ開始も防げる）。
   *
   * onPointerDown と onClick の両方から呼ぶのは冗長だが、同じ値を入れるだけなので
   * 副作用がなく、「クリックが届かない」系の無反応を二重に塞げる。キーボード
   * （Tab → Enter/Space）は native <button> の click として同じ経路を通る。
   */
  const select = useCallback((e: React.SyntheticEvent, slug: string) => {
    e.stopPropagation();
    setSelected(slug);
  }, []);

  // 読み込み中・失敗時は何も描かない。親が常設している下層の Google マップ埋め込み
  // （iframe）がそのまま見えているので、空白にもならず C5 も途切れない。
  if (loadError || !isLoaded) return null;

  const selectedPin = pins.find((p) => p.slug === selected) ?? null;

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={NEUTRAL_CENTER}
      zoom={11}
      options={MAP_OPTIONS}
      onLoad={handleLoad}
      // 初回のタイル描画完了。ここで初めて親が下層の iframe を外す（＝見た目の入れ替え）。
      // 認証失敗時は発火しないため、下層が外れて空箱になることはない。
      onTilesLoaded={onPainted}
    >
      {pins.map((pin) => {
        const isSelected = pin.slug === selected;
        return (
          <OverlayViewF
            key={pin.slug}
            position={{ lat: pin.lat, lng: pin.lng }}
            mapPaneName={OVERLAY_MOUSE_TARGET}
            zIndex={isSelected ? 2 : 1}
            // 要素の「ピン中心」が座標に重なるように左右中央・上方向へずらす。
            getPixelPositionOffset={(width) => ({
              x: -(width / 2),
              y: -(PIN_SIZE / 2),
            })}
          >
            <button
              type="button"
              aria-label={`${pin.name}（${pin.routeCount}コース）`}
              onPointerDown={(e) => select(e, pin.slug)}
              onClick={(e) => select(e, pin.slug)}
              style={{
                appearance: "none",
                border: 0,
                background: "transparent",
                padding: 0,
                margin: 0,
                cursor: "pointer",
                pointerEvents: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: PIN_SIZE,
                  height: PIN_SIZE,
                  borderRadius: 9999,
                  backgroundColor: isSelected
                    ? "var(--color-ww-accent-hover)"
                    : "var(--color-ww-accent)",
                  border: "2px solid #FFFFFF",
                  // 白地・緑地どちらの上でも輪郭が消えないための髪の毛1本の輪郭。
                  // HakoneDogMap のマーカーと同じ作法（装飾の影ではない）。
                  boxShadow: "0 0 0 1px rgba(42,42,42,0.16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin
                  size={PIN_GLYPH}
                  weight="regular"
                  color="#FFFFFF"
                  aria-hidden
                />
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ww-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.4,
                  color: "var(--color-ww-text)",
                  backgroundColor: "rgba(255,255,255,0.96)",
                  border: "1px solid var(--color-ww-border-strong)",
                  borderRadius: "var(--radius-ww-sm)",
                  padding: "2px 7px",
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
            pixelOffset: new google.maps.Size(0, -(PIN_SIZE / 2)),
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
