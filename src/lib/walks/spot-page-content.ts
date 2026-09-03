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
 * spot_page_body から meta を作るときの上限。
 * 本文は編集部が「検索者の問いへの答え」を冒頭に置いて書いているので、テンプレを挟まず
 * 冒頭から文単位で詰める。110 は詰める側の上限、120 は「駐車場あり。」を足したあとの上限。
 */
const BODY_META_TARGET_LENGTH = 110;
const BODY_META_MAX_WITH_PARKING = 120;
const PARKING_SUFFIX = "駐車場あり。";

/** 句点で文に割る（末尾の句点は保持する）。実データに「！」「？」は無い。 */
function splitSentences(text: string): string[] {
  return text
    .split("。")
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .map((t) => `${t}。`);
}

/**
 * spot_page_body 起点の meta。テンプレは一切挟まない。
 *
 * なぜ（2026-09-03 本番実測）:
 *   /spots/hasedera-monzen は「長谷寺 犬連れ」で 212表示 0クリック。本文の第2文・第3文
 *   （境内へは入れない／歩けるのは山門の手前まで）こそが検索者の問いへの答えなのに、
 *   テンプレを並べたあと第1文だけを足して終わっており、答えがスニペットに届いていなかった。
 *
 * 規則:
 *   - 冒頭から句点単位で詰める。110字を超える文は足さない＝文の途中では絶対に切らない
 *   - 1文目だけは上限を超えても入れる（切らずに1文で打ち切る）
 *   - 詰め終わって余裕があり駐車場があれば「駐車場あり。」を足す（120字を超えるなら足さない）
 *   - 料金語を含む文は飛ばす（本文は編集部が書くので現状ゼロだが、将来の混入に備える）
 */
function buildMetaFromSpotPageBody(body: string, hasParking: boolean): string | null {
  const sentences = splitSentences(body).filter((t) => !hasPriceWord(t));
  if (sentences.length === 0) return null;

  let desc = sentences[0];
  for (const s of sentences.slice(1)) {
    if (desc.length + s.length > BODY_META_TARGET_LENGTH) break;
    desc += s;
  }

  if (hasParking && desc.length + PARKING_SUFFIX.length <= BODY_META_MAX_WITH_PARKING) {
    desc += PARKING_SUFFIX;
  }
  return desc;
}

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
 *
 * 2026-09-03 追加: spot_page_body が入っているスポットでは、下のテンプレ組み立てを
 * 一切使わず buildMetaFromSpotPageBody に委ねる（編集部が書いた「答え」を冒頭から
 * そのまま届けるため）。NULL のスポットは従来どおりテンプレ生成。
 */
export function buildSpotMetaDescription(args: {
  name: string;
  areaName: string;
  categoryLabel?: string | null;
  petFriendly: boolean;
  /**
   * route_spots.spot_page_body。入っていればテンプレを使わず、この本文の冒頭から
   * 文単位で meta を作る（編集部が書いた答えをスニペットに届けるため）。
   */
  spotPageBody?: string | null;
  /** route_spots.description。テンプレ生成で素材が薄いときの穴埋めに先頭1文だけ使う。 */
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

  // spot_page_body があるスポットは、テンプレを組み立てずに本文の冒頭を使う。
  const editorialBody = args.spotPageBody?.trim();
  if (editorialBody) {
    const fromBody = buildMetaFromSpotPageBody(editorialBody, Boolean(hasParking));
    if (fromBody) return fromBody;
  }

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
    // 「〜ができます」は付けない。activity_suggestions には名詞止め（「砂浜で記念撮影」）と
    // 動詞止め（「東京湾を眺める」「参道の花を楽しむ」）が混在しており、接尾辞を機械的に
    // 足すと「東京湾を眺めるができます」と壊れる（2026-09-03 Preview 実測で発覚）。
    // 「〜など。」は両方に自然に付き、直前の「見どころは◯◯。」とも並びが揃う。
    activities.length > 0 ? `過ごし方は、${activities.join("・")}など。` : null,
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
