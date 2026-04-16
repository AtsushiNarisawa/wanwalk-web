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
  created_at: string;
  updated_at: string;
  // joined
  areas?: Area;
}

export interface PetInfo {
  parking?: string;
  surface?: string;
  restroom?: string;
  water_station?: string;
  pet_facilities?: string;
  pet_friendly_cafes?: boolean;
  best_season?: string;
  stairs?: string;
  elevation_gain?: string;
  others?: string;
}

export interface RouteSpot {
  id: string;
  route_id: string;
  spot_order: number;
  spot_type: "start" | "landscape" | "photo_spot" | "facility" | "end";
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
}

export interface RouteWithArea extends OfficialRoute {
  areas: Area;
}
