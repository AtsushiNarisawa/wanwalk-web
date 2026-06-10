// Apple Universal Links のドメイン認証ファイル（AASA）。
//
// iOS は拡張子なし・Content-Type: application/json でないと AASA を認識しない
// （過去事故事例あり）。public/ の静的ファイルだと拡張子なしファイルの Content-Type が
// 環境依存になるため、Route Handler で配信して Content-Type を明示保証する。
// 既存の api/*/route.ts と同じ Route Handler 規約。
//
// 設計書: wanwalk リポジトリ docs/mvp_specs/A2_universal_links.md
//
// appID = <Team ID>.<Bundle ID> = XJ3H4ASPGR.com.doghub.wanwalk
//   - XJ3H4ASPGR  : App Store Connect 上の Team ID（メモリ確定値）
//   - com.doghub.wanwalk : iOS Bundle ID
//
// claim するパスは「アプリが確実に該当画面へ遷移できるもの」だけに限定する。
// v1 は /routes/* と /（ホーム）のみ。/areas・/spots はアプリ側に slug 起点の
// 画面遷移が実装されたら components に追加する（未実装のまま claim すると、
// アプリが開くのにホームへフォールバックして UX が劣化するため）。

const APPLE_APP_ID = "XJ3H4ASPGR.com.doghub.wanwalk";

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appIDs: [APPLE_APP_ID],
        components: [
          { "/": "/routes/*", comment: "ルート詳細" },
          { "/": "/", comment: "トップ（ホームフィード）" },
        ],
      },
    ],
  },
  webcredentials: {
    apps: [APPLE_APP_ID],
  },
};

// 内容は固定なのでビルド時にプリレンダして静的配信する。
export const dynamic = "force-static";

export function GET() {
  return new Response(JSON.stringify(AASA), {
    headers: {
      "content-type": "application/json",
      // DNS / ドメイン切替時の AASA キャッシュ暴発を避けるため 1 時間（設計書 R-A2-03）。
      "cache-control": "public, max-age=3600",
    },
  });
}
