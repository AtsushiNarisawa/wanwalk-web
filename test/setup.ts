// import 時に @supabase/supabase-js の createClient が undefined env で throw しないよう
// ダミーの環境変数を補う（実際の通信は各テストの vi.mock で遮断する）。
process.env.NEXT_PUBLIC_WANWALK_SUPABASE_URL ||= "https://test.supabase.co";
process.env.NEXT_PUBLIC_WANWALK_SUPABASE_ANON_KEY ||= "test-anon-key";
