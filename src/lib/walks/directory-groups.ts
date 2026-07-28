/**
 * 箱根 犬連れおでかけマップβ — 5 グループ（泊/食/遊/温/病院）の Single Source of Truth。
 *
 * 地図ピン色・凡例・フィルタ・カードの群バッジが、すべてこの定義を参照する。
 *
 * ■ 配色（2026-06-05 CEO 確定・「赤を避ける」）
 *   DESIGN_TOKENS §12-A はルート線/S・Gピン色しか定義しておらず群色は未定義のため、
 *   既定トークン色から抑制トーンで割り当てる:
 *     泊 stay     = #6B7F5B 深緑   (accent-primary)
 *     食 eat      = #B8905C 金     (accent-secondary)
 *     遊 play     = #5B728A 青     (semantic-info)
 *     温 onsen    = #556649 濃緑   (accent-primary-hover)
 *     病 hospital = #6B6B6B 墨グレー (text-secondary)
 *   ★ 泊(深緑)と温(濃緑)は近似色。ピンは「色 + 白アイコングリフ」で群を二重に表現し、
 *     House / Drop の形 + 常設凡例で識別する（温泉は2件のみで混同リスク低）。
 *   ★ hospital に semantic-error(#A84A3D テラコッタ) は使わない。上記 CEO 決定「赤を避ける」に
 *     反するため。DESIGN_TOKENS のパレットで4群と明確に識別でき、かつブランド構造色
 *     （深緑系）でもない残りの選択肢が text-secondary #6B6B6B。地図では既に
 *     「スポット番号」の枠・数字色として使われている中立色で、レジャー群と競合しない。
 *
 * ■ 中立性
 *   群の区別は「色分け（発見性）」のためであり、施設間の序列ではない。
 *   群ごとのスタイルは全施設で完全均一（PR/おすすめバッジは持たない）。
 *   ★ 動物病院は「遊ぶ」に入れない。ドッグラン等のレジャー施設と誤解させないため。
 */
import type {
  DirectoryCategory,
  DirectoryGroup,
  DirectoryDogPolicy,
  DirectoryPlace,
} from "@/types/directory";

export interface DirectoryGroupDef {
  key: DirectoryGroup;
  label: string; // 凡例・フィルタ表示名
  color: string; // ピン塗り色（白縁・白グリフ）
  // Phosphor Regular（fill ベース）の path。地図 DivIcon に raw 埋め込みする。
  iconPath: string;
  categories: DirectoryCategory[];
}

// 表示順（泊→食→遊→温→病院）。
export const DIRECTORY_GROUP_ORDER: DirectoryGroup[] = [
  "stay",
  "eat",
  "play",
  "onsen",
  "hospital",
];

// Phosphor Icons Regular weight の path（node_modules から抽出した正本）。
const ICON_HOUSE =
  "M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z";
const ICON_FORKKNIFE =
  "M72,88V40a8,8,0,0,1,16,0V88a8,8,0,0,1-16,0ZM216,40V224a8,8,0,0,1-16,0V176H152a8,8,0,0,1-8-8,268.75,268.75,0,0,1,7.22-56.88c9.78-40.49,28.32-67.63,53.63-78.47A8,8,0,0,1,216,40ZM200,53.9c-32.17,24.57-38.47,84.42-39.7,106.1H200ZM119.89,38.69a8,8,0,1,0-15.78,2.63L112,88.63a32,32,0,0,1-64,0l7.88-47.31a8,8,0,1,0-15.78-2.63l-8,48A8.17,8.17,0,0,0,32,88a48.07,48.07,0,0,0,40,47.32V224a8,8,0,0,0,16,0V135.32A48.07,48.07,0,0,0,128,88a8.17,8.17,0,0,0-.11-1.31Z";
const ICON_BINOCULARS =
  "M237.2,151.87v0a47.1,47.1,0,0,0-2.35-5.45L193.26,51.8a7.82,7.82,0,0,0-1.66-2.44,32,32,0,0,0-45.26,0A8,8,0,0,0,144,55V80H112V55a8,8,0,0,0-2.34-5.66,32,32,0,0,0-45.26,0,7.82,7.82,0,0,0-1.66,2.44L21.15,146.4a47.1,47.1,0,0,0-2.35,5.45v0A48,48,0,1,0,112,168V96h32v72a48,48,0,1,0,93.2-16.13ZM76.71,59.75a16,16,0,0,1,19.29-1v73.51a47.9,47.9,0,0,0-46.79-9.92ZM64,200a32,32,0,1,1,32-32A32,32,0,0,1,64,200ZM160,58.74a16,16,0,0,1,19.29,1l27.5,62.58A47.9,47.9,0,0,0,160,132.25ZM192,200a32,32,0,1,1,32-32A32,32,0,0,1,192,200Z";
const ICON_DROP =
  "M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z";
const ICON_FIRSTAID =
  "M216,88H168V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V88H40a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16H88v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V168h48a16,16,0,0,0,16-16V104A16,16,0,0,0,216,88Zm0,64H160a8,8,0,0,0-8,8v56H104V160a8,8,0,0,0-8-8H40V104H96a8,8,0,0,0,8-8V40h48V96a8,8,0,0,0,8,8h56Z";

export const DIRECTORY_GROUPS: Record<DirectoryGroup, DirectoryGroupDef> = {
  stay: {
    key: "stay",
    label: "泊まる",
    color: "#6B7F5B",
    iconPath: ICON_HOUSE,
    categories: ["accommodation"],
  },
  eat: {
    key: "eat",
    label: "食べる",
    color: "#B8905C",
    iconPath: ICON_FORKKNIFE,
    categories: ["cafe", "restaurant"],
  },
  play: {
    key: "play",
    label: "遊ぶ",
    color: "#5B728A",
    iconPath: ICON_BINOCULARS,
    categories: ["sightseeing", "dog_run", "shop"],
  },
  onsen: {
    key: "onsen",
    label: "温泉・足湯",
    color: "#556649",
    iconPath: ICON_DROP,
    categories: ["onsen", "footbath"],
  },
  hospital: {
    key: "hospital",
    label: "動物病院",
    color: "#6B6B6B",
    iconPath: ICON_FIRSTAID,
    categories: ["animal_hospital"],
  },
};

// カテゴリ → グループの逆引き（subcategory 欠損時のフォールバック）。
const CATEGORY_TO_GROUP: Record<DirectoryCategory, DirectoryGroup> = (() => {
  const map = {} as Record<DirectoryCategory, DirectoryGroup>;
  for (const g of DIRECTORY_GROUP_ORDER) {
    for (const c of DIRECTORY_GROUPS[g].categories) map[c] = g;
  }
  return map;
})();

export const DIRECTORY_CATEGORY_LABELS: Record<DirectoryCategory, string> = {
  accommodation: "宿泊",
  cafe: "カフェ",
  restaurant: "レストラン",
  sightseeing: "観光・レジャー",
  onsen: "温泉",
  footbath: "足湯",
  dog_run: "ドッグラン",
  shop: "ショップ",
  animal_hospital: "動物病院",
};

const VALID_GROUPS = new Set<string>(DIRECTORY_GROUP_ORDER);

/**
 * 公式 URL に WanWalk 出典の utm を付与（解析を持つ施設向けの無害なオマケ）。
 * 送客の真実のソースは自分側の outbound_click（GA4）。カード・地図ポップアップ共通。
 */
export function buildOutboundUrl(officialUrl: string): string {
  try {
    const u = new URL(officialUrl);
    u.searchParams.set("utm_source", "wanwalk");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", "hakone-dogmap");
    return u.toString();
  } catch {
    return officialUrl;
  }
}

/**
 * 施設の「主」グループを決定。subcategory を優先し、無ければ category から逆引き。
 * 地図ピンの色・カードの群バッジはこの1つだけを使う（1施設1ピン・1バッジ）。
 */
export function groupOfPlace(place: Pick<DirectoryPlace, "subcategory" | "category">): DirectoryGroup {
  if (place.subcategory && VALID_GROUPS.has(place.subcategory)) {
    return place.subcategory;
  }
  return CATEGORY_TO_GROUP[place.category] ?? "play";
}

/**
 * 施設が属するグループを全て返す（主グループ ＋ extra_groups）。
 * フィルタ判定と凡例の件数はこちらを使う。
 *
 * 例: 宿に併設するカフェは category='cafe'（主＝食べる）に extra_groups=['stay'] を持たせ、
 *     「食べる」でも「泊まる」でも表示されるようにする。施設名はコードに持たせない
 *     （どの施設を複数群に出すかは DB の extra_groups だけで決まる）。
 *
 * ※ 1施設が複数群に数えられるため、凡例チップの合計は施設総数を上回りうる。
 *   一覧の「◯件」は実際に描画するカード枚数（重複なし）を使うこと。
 */
export function groupsOfPlace(
  place: Pick<DirectoryPlace, "subcategory" | "category" | "extra_groups">
): DirectoryGroup[] {
  const primary = groupOfPlace(place);
  const groups: DirectoryGroup[] = [primary];
  for (const g of place.extra_groups ?? []) {
    // 未知の値（DB 側の CHECK をすり抜けた場合）と主グループの重複を弾く。
    if (VALID_GROUPS.has(g) && !groups.includes(g)) groups.push(g);
  }
  return groups;
}

/** 施設が、選択中の群のいずれかに該当するか（フィルタ判定の単一の窓口）。 */
export function matchesActiveGroups(
  place: Pick<DirectoryPlace, "subcategory" | "category" | "extra_groups">,
  active: ReadonlySet<DirectoryGroup>
): boolean {
  return groupsOfPlace(place).some((g) => active.has(g));
}

/** status='conditional'（条件付き）か。 */
export function isConditional(policy: DirectoryDogPolicy | null | undefined): boolean {
  return policy?.status === "conditional";
}

const SIZE_LABELS: Record<string, string> = {
  all: "全犬種OK",
  small_medium: "中型犬まで",
  small_only: "小型犬のみ",
};

/**
 * dog_policy → 一目で分かる短い事実チップの配列。
 * 誇張しない・断定しない（情報が無い項目は出さない）。詳細は notes 全文で補う。
 * category により「店内/客室」のラベルを文脈に合わせる。
 */
export function formatDirectoryDogChips(
  policy: DirectoryDogPolicy | null | undefined,
  category: DirectoryCategory
): string[] {
  if (!policy) return [];
  const chips: string[] = [];

  // サイズ（unknown は出さない）
  if (policy.size && SIZE_LABELS[policy.size]) chips.push(SIZE_LABELS[policy.size]);

  // 同伴できる場所（カテゴリで文言を変える）
  const isStay = category === "accommodation";
  if (policy.indoor === true && policy.terrace === true) {
    chips.push(isStay ? "客室・屋外OK" : "店内・テラスOK");
  } else if (policy.indoor === true) {
    chips.push(isStay ? "客室同伴可" : "店内OK");
  } else if (policy.terrace === true) {
    chips.push(isStay ? "屋外スペースOK" : "テラスのみ");
  }

  if (policy.leash_required === true) chips.push("リード必須");
  if (policy.carrier_required === true) chips.push("キャリー必須");
  if (policy.dog_fee && policy.dog_fee.trim() !== "") chips.push("ペット料金あり");

  return chips;
}
