/**
 * /spots/{slug}（スポット単体ページ）専用のテキスト組み立て。
 *
 * なぜ独立モジュールなのか（2026-09-03）:
 *   スポットページの本文は route_spots.description をそのまま出しており、同じ文字列が
 *   /routes/{slug} の旅程にも一字一句出ている＝重複コンテンツだった。固有情報を足して
 *   「ルート本文の断片」から脱させるため、DB に眠っていた landscape_feature /
 *   activity_suggestions / official_routes.pet_info->>'parking' を描画に回す。
 *   これらは**今まで一度も画面に出たことがない列**なので、CEO 決定の掲載禁止事項
 *   （料金・同伴条件）を通す経路が新たに開く。素通しにせずここで一元的に濾す。
 *
 * ここに置くもの: 料金語ガード / meta description の組み立て / ルート内位置の文言。
 * ここに置かないもの: 見た目（page.tsx）・DB アクセス（data.ts）。
 */

/**
 * 料金語の検出（2026-09-02 CEO 決定「料金は『無料』『有料』の別も書かない」）。
 *
 * 変わるから載せない、が理由。金額だけでなく「無料/有料」というラベルも対象。
 *
 * 「円」を単体で弾かないのは誤爆するため（実データに「円覚寺の山門と緑」
 * 「千円札と同じ構図で撮影」があり、どちらも料金の話ではない）。金額としての円は
 * 算用数字（半角/全角）が前置する形だけを拾う。「千円札」は漢数字なので当たらない。
 */
const PRICE_WORD_RE =
  /(無料|有料|料金|入場料|入園料|拝観料|利用料|駐車料|[0-9０-９][0-9０-９,，]*\s*円)/;

export function hasPriceWord(text: string | null | undefined): boolean {
  if (!text) return false;
  return PRICE_WORD_RE.test(text);
}

/**
 * 料金語を含んでいても駐車場欄をそのまま通してよいルート slug。
 *
 * ポーラ美術館だけは既存文言（「あり（ポーラ美術館駐車場・有料）」）のまま通してよい、
 * というのが CEO の明示的な例外指定。ここを増やすときは CEO 承認が要る。
 * 2026-09-03 時点で公開100本のうち駐車場欄に料金語を含むのはこの1本だけ（実測）。
 *
 * ⚠️ この例外は /spots では新規露出になる。ポーラ美術館ルートの SEO 対象スポット4件
 * （mori-no-naka-no-chokoku-sakuhin-eria / mori-no-oku-yacho-kansatsu-eria /
 *  mori-no-tembo-pointo / kisetsu-no-hana-to-chokoku-no-koraboeria）の「行き方」に
 * 「有料」が出る。止めるならこの Set から slug を消すだけ（その4件は駐車場行が消える）。
 */
export const PARKING_PRICE_WORD_ALLOWED_ROUTE_SLUGS: ReadonlySet<string> = new Set([
  "hakone-sengokuhara-pola-museum-trail",
]);

/** 料金語を含むなら丸ごと落とす（部分的に消して不完全な文にしない）。 */
export function sanitizeText(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v) return null;
  return hasPriceWord(v) ? null : v;
}

/** 配列は要素単位で濾す（1件が料金語でも残りは活かす）。 */
export function sanitizeList(values: readonly string[] | null | undefined): string[] {
  if (!values) return [];
  return values
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v) && !hasPriceWord(v));
}

/** 駐車場欄。ポーラ美術館のルートだけ料金語ガードを免除する。 */
export function sanitizeParking(
  value: string | null | undefined,
  routeSlug: string
): string | null {
  const v = value?.trim();
  if (!v) return null;
  if (PARKING_PRICE_WORD_ALLOWED_ROUTE_SLUGS.has(routeSlug)) return v;
  return hasPriceWord(v) ? null : v;
}

/**
 * ルート内の位置。「起点から◯◯地点（全体◯.◯km・所要約◯分）」。
 *
 * 距離表記は DESIGN_TOKENS §9 の使い分けに従う。区間（起点からの距離）は
 * formatSpotDistance（1km 未満は整数 m）、ルート総距離は formatDistance（常に km）。
 * distance_from_start が無いスポットでは null を返す＝行ごと出さない。
 */
export function buildRoutePositionText(args: {
  distanceFromStart: number | null | undefined;
  routeDistanceMeters: number | string | null | undefined;
  estimatedMinutes: number | null | undefined;
  formatSpotDistance: (m: number) => string;
  formatDistance: (m: number) => string;
}): string | null {
  const { distanceFromStart, routeDistanceMeters, estimatedMinutes } = args;
  if (distanceFromStart == null || !Number.isFinite(Number(distanceFromStart))) {
    return null;
  }
  const d = Math.round(Number(distanceFromStart));
  if (d < 0) return null;

  const head =
    d === 0
      ? "このルートの起点にあたります"
      : `このルートの起点から${args.formatSpotDistance(d)}地点です`;

  const parts: string[] = [];
  const total = Number(routeDistanceMeters);
  if (Number.isFinite(total) && total > 0) {
    parts.push(`全体${args.formatDistance(total)}`);
  }
  if (estimatedMinutes != null && Number.isFinite(Number(estimatedMinutes)) && Number(estimatedMinutes) > 0) {
    parts.push(`所要約${Math.round(Number(estimatedMinutes))}分`);
  }

  return parts.length > 0 ? `${head}（${parts.join("・")}）。` : `${head}。`;
}

const META_TARGET_LENGTH = 120;

/**
 * meta description。そのスポット固有の素材を組み立てて作る。
 *
 * 旧実装は `${エリア}の${カテゴリ}「${名前}」。${犬連れOK}${description.slice(0,80)}` で、
 * description が /routes/{slug} の旅程と同一だったため meta まで重複していた。しかも
 * 素の slice なので 80 字目で文が切れて意味不明になっていた。
 *
 * 方針:
 *   - 先頭で「そこが何か」と「愛犬と歩けるか」に答える
 *   - 以降は固有素材（見どころ・過ごし方・親ルート・駐車場の有無）を**文単位**で足す
 *   - 目安 120 字。文の途中では切らない（足して超えるなら、その文を足さない）
 *   - spot_page_body があるときは description ではなくそちらを優先素材にする
 *
 * pet_friendly=false のとき「入れません」とは書かない。犬の同伴条件（可否の詳細・
 * リード・サイズ等）は載せない決定（2026-08-02）があり、肯定の事実だけを載せてよい、
 * というのが境界だから。否定の断定を機械生成すると条件の話に踏み込むことになる。
 *
 * 駐車場は「あり」の事実だけ。台数・料金は meta に出さない
 * （feedback_parking_details_avoid_in_meta / 料金は全面禁止）。
 */
export function buildSpotMetaDescription(args: {
  name: string;
  areaName: string;
  categoryLabel?: string | null;
  petFriendly: boolean;
  /** spot_page_body ?? description。素材として先頭1文だけ使う。 */
  bodyText?: string | null;
  landscapeFeature?: string | null;
  activitySuggestions?: readonly string[] | null;
  routeName?: string | null;
  hasParking?: boolean;
}): string {
  const {
    name,
    areaName,
    categoryLabel,
    petFriendly,
    bodyText,
    routeName,
    hasParking,
  } = args;

  const feature = sanitizeText(args.landscapeFeature);
  const activities = sanitizeList(args.activitySuggestions).slice(0, 2);

  // 1文目: そこが何か。
  const head = categoryLabel
    ? `${areaName}の${categoryLabel}「${name}」。`
    : `${areaName}の犬連れスポット「${name}」。`;

  // 2文目: 愛犬と歩けるか（肯定のときだけ断定する）。
  const dogSentence = petFriendly ? "愛犬と一緒に立ち寄れます。" : null;

  const candidates: (string | null)[] = [
    dogSentence,
    feature ? `見どころは${feature}。` : null,
    activities.length > 0 ? `${activities.join("・")}ができます。` : null,
    routeName ? `${routeName}の途中にあります。` : null,
    hasParking ? "駐車場あり。" : null,
  ];

  let desc = head;
  for (const s of candidates) {
    if (!s) continue;
    if (desc.length + s.length > META_TARGET_LENGTH) continue;
    desc += s;
  }

  // 固有素材が薄いスポット（landscape_feature も activity_suggestions も無い等）では
  // 本文の先頭1文で埋めて 120 字前後に寄せる。slice ではなく句点区切りなので途中で切れない。
  // 閾値 90 は「見どころ＋過ごし方が揃っていれば埋めない／頭とルートだけなら埋める」の境目
  // （実測: 素材が揃うと 90〜120 字、頭＋ルート＋駐車場だけだと 60〜75 字になる）。
  if (desc.length < 90 && bodyText) {
    const firstSentence = bodyText.trim().split("。")[0];
    if (firstSentence && !hasPriceWord(firstSentence)) {
      const s = `${firstSentence}。`;
      if (desc.length + s.length <= META_TARGET_LENGTH + 20) desc += s;
    }
  }

  return desc;
}
