import { createClient } from "@supabase/supabase-js";

// WanWalk専用Supabase（Hotel Supabaseとは別プロジェクト）
const wanwalkUrl = process.env.NEXT_PUBLIC_WANWALK_SUPABASE_URL!;
const wanwalkAnonKey = process.env.NEXT_PUBLIC_WANWALK_SUPABASE_ANON_KEY!;

export const wanwalkSupabase = createClient(wanwalkUrl, wanwalkAnonKey);
