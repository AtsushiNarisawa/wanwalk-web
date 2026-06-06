/**
 * 施設ディレクトリ（directory_places）の型。
 *
 * 散歩ルート（official_routes / route_spots）から独立した「地域 × 犬連れ施設」ディレクトリ。
 * 箱根 犬連れおでかけマップβ（/hakone/dog-map）で使用。
 *
 * ⚠️ 既存の SpotCategory(10) / DogPolicy とは別系統。dog_policy.size に "unknown"、
 *    status(ok/conditional)、dog_fee(文字列) を持つため専用型を切る（HAKONE_DOGMAP_SPEC §10-7）。
 */

// 4 つの表示グループ（地図フィルタ・色分けの単位）。DB の subcategory に格納。
export type DirectoryGroup = "stay" | "eat" | "play" | "onsen";

// 施設カテゴリ（DB の category・8値CHECK）。
export type DirectoryCategory =
  | "accommodation"
  | "cafe"
  | "restaurant"
  | "sightseeing"
  | "onsen"
  | "footbath"
  | "dog_run"
  | "shop";

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
// description は areas テーブルの CEO 監修文（エリア紹介＋渋滞回避の運転経路を含む）。
export interface DirectoryArea {
  slug: string;
  name: string;
  description: string | null;
}

// directory_places_with_latlng ビューの1行（表示に必要な列のみ）。
export interface DirectoryPlace {
  id: string;
  region: string;
  area_id: string | null;
  name: string;
  category: DirectoryCategory;
  subcategory: DirectoryGroup | null;
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
