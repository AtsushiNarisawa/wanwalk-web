/**
 * 施設ディレクトリ（directory_places）の型。
 *
 * 散歩ルート（official_routes / route_spots）から独立した「地域 × 犬連れ施設」ディレクトリ。
 * 箱根 犬連れおでかけマップβ（/hakone/dog-map）で使用。
 *
 * ⚠️ 既存の SpotCategory(10) / DogPolicy とは別系統。dog_policy.size に "unknown"、
 *    status(ok/conditional)、dog_fee(文字列) を持つため専用型を切る（HAKONE_DOGMAP_SPEC §10-7）。
 */

// 5 つの表示グループ（地図フィルタ・色分けの単位）。DB の subcategory に格納。
// hospital（動物病院）は「遊ぶ」に混ぜない＝ドッグラン等のレジャーと誤解させないため独立群。
export type DirectoryGroup = "stay" | "eat" | "play" | "onsen" | "hospital";

// 施設カテゴリ（DB の category・9値CHECK）。
export type DirectoryCategory =
  | "accommodation"
  | "cafe"
  | "restaurant"
  | "sightseeing"
  | "onsen"
  | "footbath"
  | "dog_run"
  | "shop"
  | "animal_hospital";

export type DirectoryDogSize = "all" | "small_medium" | "small_only" | "unknown";
export type DirectoryDogStatus = "ok" | "conditional";

// route_spots の DogPolicy より広い。各 bool は null（情報なし）を取りうる。
export interface DirectoryDogPolicy {
  size?: DirectoryDogSize | null;
  status?: DirectoryDogStatus | null;
  indoor?: boolean | null;
  terrace?: boolean | null;
  leash_required?: boolean | null;
  carrier_required?: boolean | null;
  dog_fee?: string | null;
  notes?: string | null;
}

// 施設から歩ける最寄りの公開ルート（PostGIS KNN・描画時に RPC で算出）。
export interface NearestRoute {
  slug: string;
  name: string;
  dist_m: number;
}

// 施設が属するサブエリア（エリア順表示・交通案内に使用）。
// 文面は areas.directory_intro / directory_access（このマップ専用列）をそのまま使う。
// ⚠️ areas.description（公開サイト /areas の SEO 資産）は参照しない。
//    かつては description を句点で機械分割していたが、専用列へ移行して分離した。
export interface DirectoryArea {
  slug: string;
  name: string;
  directory_intro: string | null;
  directory_access: string | null;
  // 公開中の散歩ルートを 1 本以上持つか（データ層で算出）。
  // false のエリアは /areas/{slug} が公開側で 404 になるため導線を出さない。
  has_routes: boolean;
}

// directory_places_with_latlng ビューの1行（表示に必要な列のみ）。
export interface DirectoryPlace {
  id: string;
  region: string;
  area_id: string | null;
  name: string;
  category: DirectoryCategory;
  subcategory: DirectoryGroup | null;
  // 主カテゴリ由来の群に加えて、この施設を出したい群（例: 宿に併設するカフェ）。
  // 地図ピンの色は主カテゴリのままで、フィルタと凡例の件数にだけ効く。
  // コードに施設名を持たせない汎用の仕組み（DB の extra_groups 列）。
  extra_groups: DirectoryGroup[] | null;
  lat: number;
  lng: number;
  description: string | null;
  dog_policy: DirectoryDogPolicy | null;
  photo_url: string | null;
  official_url: string | null;
  phone: string | null;
  price_range: string | null;
  opening_hours: string | null;
  verified_at: string | null;
  utm_slug: string | null;
  is_published: boolean;
  // データ層で結合（描画時に算出した最寄りルート・距離昇順）。
  nearest_routes?: NearestRoute[];
  // データ層で結合（area_id → サブエリア）。エリア順表示・交通案内に使用。
  area?: DirectoryArea | null;
}
