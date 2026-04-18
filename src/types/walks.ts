export interface Area {
  id: string;
  name: string;
  slug: string;
  prefecture: string;
  description: string | null;
  hero_image_url?: string | null;
}

export interface RoutePinWithPhoto {
  id: string;
  route_id: string;
  title: string;
  comment: string | null;
  pin_type: string | null;
  photo_url: string | null;
}

export interface OfficialRoute {
  id: string;
  area_id: string;
  name: string;
  slug: string;
  description: string | null;
  meta_description: string | null;
  is_published: boolean;
  difficulty_level: "easy" | "moderate" | "hard";
  distance_meters: number;
  estimated_minutes: number;
  elevation_gain_meters: number | null;
  thumbnail_url: string | null;
  gallery_images: string[] | null;
  pet_info: PetInfo | null;
  total_pins: number;
  total_walks: number;
  start_lat: number;
  start_lng: number;
  cart_friendly: boolean;
  created_at: string;
  updated_at: string;
  // joined
  areas?: Area;
}

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface PetInfo {
  parking?: string;
  surface?: string;
  restroom?: string;
  water_station?: string;
  pet_facilities?: string;
  pet_friendly_cafes?: boolean;
  best_season?: string;
  best_season_tags?: Season[];
  stairs?: string;
  elevation_gain?: string;
  others?: string;
}

export type SpotCategory =
  | "cafe"
  | "restaurant"
  | "park"
  | "dog_run"
  | "water_station"
  | "restroom"
  | "parking"
  | "viewpoint"
  | "shop";

export interface DogPolicy {
  size?: "all" | "small_medium" | "small_only";
  indoor?: boolean;
  terrace?: boolean;
  leash_required?: boolean;
  carrier_required?: boolean;
  dog_fee?: string;
  notes?: string;
}

export interface RouteSpot {
  id: string;
  route_id: string;
  spot_order: number;
  spot_type: "start" | "waypoint" | "end";
  name: string;
  description: string | null;
  landscape_feature: string | null;
  activity_suggestions: string[] | null;
  seasonal_notes: Record<string, string> | null;
  facility_type: string | null;
  pet_friendly: boolean;
  opening_hours: string | null;
  is_optional: boolean;
  tips: string | null;
  distance_from_start: number | null;
  estimated_time_from_start: number | null;
  category: SpotCategory | null;
  dog_policy: DogPolicy | null;
  photo_url: string | null;
  website_url: string | null;
  phone: string | null;
  price_range: string | null;
  lat: number | null;
  lng: number | null;
}

export interface RouteWithArea extends OfficialRoute {
  areas: Area;
}
