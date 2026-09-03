// /spots/{slug} を noindex（follow は維持）にする対象 slug 台帳。
//
// なぜこの48件なのか（2026-09-03 判断・GSC 実測ベース）:
//   スポット単体ページの本文は、親ルート詳細（/routes/{slug}）の旅程テキストと一字一句同じで
//   重複コンテンツになっており、同じクエリで親ルートと共倒れする例が出ていた
//   （例: /spots/sen-jo-no-taki は 169imp・平均51.6位・0click に対し、同期間で親ルートは13.6位）。
//   全期間（2026-04-16〜2026-09-02）の GSC 実測で全304件を4群に仕分けし、
//   そのうち需要が確認できなかった「整理」群だけをここに置く。
//     - A 強化 45件 … 全スポットクリックの 79.5%（801click）。触らない
//     - B 修理 97件 … 8.4%。2026-09-03 の地図追加の効果を1ヶ月見てから判断（触らない）
//     - C 保留 77件 … 6.5%。spot 自体が季節もの（桜・紅葉・すすき等）。来春の需要を落とすので触らない
//     - D 整理 48件 … 0.4%（48件合計で 4click / 138imp・最大でも 2click）。うち20件は GSC に一度も現れていない
//                      ＝ このファイル。spot 自体の季節根拠は 0 件（季節ページの巻き込みなし）
//     - 境界 37件 … 5.2%。判定保留・触らない
//
// なぜ noindex（follow: true）なのか:
//   ページ自体は残す。ルート詳細への内部リンクの評価は流し続けたいので follow は維持する。
//   削除・410・canonical 変更はしない（GONE_SPOT_SLUGS とは目的が違う。あちらは「もう無いページ」）。
//
// 戻し方:
//   この配列から該当 slug の行を消すだけで index に戻る（DB もページ本体も一切変えていない）。
//   1ヶ月後に GSC で imp が伸びている slug があれば個別に外す。全廃したいときはこのファイルを空配列にする。
//
// 参照箇所:
//   - src/app/spots/[slug]/page.tsx  generateMetadata の robots
//   - src/app/sitemap.ts             noindex と sitemap 掲載の不整合を避けるため除外
export const LOW_DEMAND_NOINDEX_SPOT_SLUGS: ReadonlySet<string> = new Set([
  "arasaki-bentenjima", // 荒崎弁天島（0click / 4imp / 平均9.2位・viewpoint）
  "dai-wakuya-eki-zen-hiroba", // 大涌谷駅前広場（0click / 0imp / 平均-位・landmark）
  "dai-wakuya-kuro-tama-go-kan", // 大涌谷 黒たまご館（0click / 0imp / 平均-位・shop）
  "days-kugenuma-shonan-kugenuma", // Days 鵠沼（0click / 0imp / 平均-位・cafe）
  "dogashima-yuhodo-iriguchi", // 堂ヶ島渓谷 遊歩道入口（0click / 0imp / 平均-位・viewpoint）
  "edo-no-ishidatami", // 旧東海道 江戸の石畳（0click / 4imp / 平均5.5位・viewpoint）
  "funkako-tembo", // 大室山 噴火口展望（0click / 0imp / 平均-位・viewpoint）
  "hakonature-base-yumoto", // HAKONATURE BASE (ハコネイチャー ベース)（2click / 9imp / 平均9.3位・cafe）
  "hakone-shrine-1st-torii-gate", // 箱根神社 第一鳥居（0click / 1imp / 平均3.0位・viewpoint）
  "hakone-shrine-1st-torii-gate-hakone", // 箱根神社 第一鳥居（0click / 5imp / 平均6.8位・viewpoint）
  "heddorando-karano-fujisan", // 茅ヶ崎ヘッドランド 富士山ビュー（0click / 8imp / 平均11.6位・viewpoint）
  "hoboku-eria", // 南ヶ丘牧場 放牧エリア（0click / 0imp / 平均-位・viewpoint）
  "hodai-ato", // 観音崎 第一砲台跡（0click / 2imp / 平均6.0位・viewpoint）
  "hotcake-parlor-little-tree", // 湘南リトルツリー／ともしびショップ湘南平（0click / 2imp / 平均6.5位・cafe）
  "ikemoto-chaya", // 池本茶屋（1click / 6imp / 平均5.0位・cafe）
  "ikoi-no-hiroba", // 荒崎公園 憩いの広場（0click / 0imp / 平均-位・park）
  "inokashirakoen-koshu-toire", // 井の頭公園公衆トイレ（0click / 0imp / 平均-位・restroom）
  "ishigama-garden-terrace", // 石窯ガーデンテラス（0click / 0imp / 平均-位・cafe）
  "iwaba-no-kaigan-sen", // 荒崎海岸 岩場の海岸線（0click / 3imp / 平均6.0位・viewpoint）
  "kadowaki-todai", // 門脇埼灯台（0click / 3imp / 平均6.0位・viewpoint）
  "kaigan-enchi-iso-asobi-eria", // 観音崎 海岸園地（0click / 4imp / 平均7.2位・viewpoint）
  "kayabuki-yane-no-shuraku", // 西湖いやしの里根場 茅葺き集落（0click / 3imp / 平均6.0位・viewpoint）
  "komayama-park-childrens-forest", // 高麗山公園 子供の森（0click / 9imp / 平均5.4位・park）
  "kyu-asakura-house", // 旧朝倉家住宅（1click / 3imp / 平均4.3位・historical_landmark）
  "motosu-kan-cafe", // 本栖館 湖畔カフェ（0click / 0imp / 平均-位・cafe）
  "nasu-nijimasu-tsuribori", // ニジマス釣り堀（0click / 0imp / 平均-位・park）
  "nasu-renzan-panorama", // 那須連山 パノラマ展望（0click / 0imp / 平均-位・viewpoint）
  "old-tokaido-road-ancient-cedars-east-end", // 旧東海道 箱根宿の杉並木（0click / 3imp / 平均12.7位・viewpoint）
  "otome-sansakuro-iriguchi", // 乙女の滝 散策路入口（0click / 3imp / 平均10.3位・viewpoint）
  "otome-sawanagawa-koke-ishi", // 沢名川 滝下流の苔石（0click / 4imp / 平均7.0位・viewpoint）
  "owakudani-eki-toilet", // 大涌谷駅構内トイレ（0click / 0imp / 平均-位・restroom）
  "sasuke-cafe", // 佐助カフェ（0click / 6imp / 平均6.5位・cafe）
  "sasuke-cafe-kamakura", // 佐助カフェ（0click / 8imp / 平均6.8位・cafe）
  "sen-gohyakurakan", // 鋸山日本寺 千五百羅漢（0click / 6imp / 平均6.3位・viewpoint）
  "seseragi-no-michi-iriguchi", // せせらぎの道 入口（0click / 3imp / 平均8.3位・viewpoint）
  "shinkyo-tamoto", // 日光 神橋たもと（0click / 8imp / 平均6.5位・viewpoint）
  "shinrinyoku-no-komichi-chisuji", // 森林浴の小径（0click / 9imp / 平均9.9位・viewpoint）
  "tembo-dai-fukin-koshu-toire", // 展望台付近公衆トイレ（0click / 5imp / 平均10.8位・restroom）
  "terrace-cafe-ippekiko", // TERRACE CAFE IPPEKIKO（0click / 0imp / 平均-位・cafe）
  "the-third-torii-of-hakone-shrine", // 箱根神社 三の鳥居（0click / 9imp / 平均5.7位・viewpoint）
  "tonai-koshu-toire", // 島内公衆トイレ（0click / 0imp / 平均-位・restroom）
  "uta-ke-hama-kohan-tembo-eria", // 歌ヶ浜 湖畔展望エリア（0click / 7imp / 平均6.6位・viewpoint）
  "watanabe-bakery", // 渡邊ベーカリー（0click / 0imp / 平均-位・shop）
  "yamanakako-kohan-saku-view", // 山中湖 湖畔の柵ビュー（0click / 0imp / 平均-位・viewpoint）
  "yamanakako-mizutori-kansatsu", // 水鳥観察ポイント（0click / 0imp / 平均-位・viewpoint）
  "yamashita-koen-koshu-toire", // 山下公園公衆トイレ（0click / 0imp / 平均-位・restroom）
  "yogan-kaigan-no-yuhodo", // 城ヶ崎 溶岩海岸遊歩道（0click / 1imp / 平均4.0位・viewpoint）
  "zaimokuza-cafe-75-th", // 材木座Cafe75th（0click / 0imp / 平均-位・cafe）
]);
