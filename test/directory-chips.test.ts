// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { createElement } from "react";
import type { DirectoryDogPolicy, DirectoryPlace } from "@/types/directory";

// 2026-08-02 CEO 確定の回帰ガード。
//
// 「犬の同伴条件（受け入れできる犬のサイズ・同伴できる場所・リード/キャリーの要否・
//   ペット料金・ワクチン要件）は WanWalk のどのページにも載せない。条件は公式サイトへ誘導する」
//
// 以前はこのファイルで formatDirectoryDogChips の文言（テラスの語彙・サイズの断定）を固定していたが、
// チップそのものを出さない方針になったため、**カードに条件が現れないこと**を固定するテストへ置き換えた。
// 関数自体は directory-groups.ts に温存してある（方針が戻ったときに配線し直せるように）。
// このテストは「関数が復活して配線された」ことを検出するのが目的なので、
// dog_policy を全項目そろえた最悪ケースで描画する。

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) =>
    createElement("img", { src: String(props.src ?? ""), alt: String(props.alt ?? "") }),
}));

import DirectoryPlaceCard from "@/components/walks/DirectoryPlaceCard";
import { formatDirectoryDogChips } from "@/lib/walks/directory-groups";

// 条件系の語をひととおり出させる dog_policy（これが1語でも描画されたら退行）。
const fullPolicy: DirectoryDogPolicy = {
  status: "conditional",
  size: "all",
  size_note: "30kg以下",
  indoor: true,
  terrace: true,
  leash_required: true,
  carrier_required: true,
  dog_fee: "1頭 300円",
  notes: "ワクチン接種証明書の提示が必要です。",
};

function makePlace(overrides: Partial<DirectoryPlace> = {}): DirectoryPlace {
  return {
    id: "p1",
    region: "hakone",
    area_id: null,
    name: "テスト施設",
    category: "cafe",
    subcategory: null,
    extra_groups: null,
    lat: 35.23,
    lng: 139.02,
    description: "芦ノ湖のほとりに建つカフェ。",
    dog_policy: fullPolicy,
    photo_url: null,
    official_url: "https://example.com/",
    phone: "+81 460-83-8800",
    price_range: "￥￥",
    opening_hours: "10:00-17:00",
    verified_at: "2026-07-15",
    utm_slug: "test-place",
    is_published: true,
    nearest_routes: [{ slug: "hakone-test-route", name: "テストルート", dist_m: 320 }],
    ...overrides,
  };
}

// 出してはいけない語。旧チップの全語彙 ＋ CEO が名指しした条件語を含む。
const FORBIDDEN = [
  "全犬種",
  "大型犬",
  "中型犬",
  "小型犬",
  "サイズは要確認",
  "30kg以下",
  "リード",
  "キャリー",
  "ペット料金",
  "1頭 300円",
  "ワクチン",
  "接種",
  "証明書",
  "条件付き",
  "同伴可",
  "店内",
  "テラス",
  "屋内も同伴可",
  "屋外エリアのみ",
  "客室",
];

describe("DirectoryPlaceCard — 犬の同伴条件は表示しない（2026-08-02 CEO 確定）", () => {
  // 上のテストが「たまたま何も出ていないだけ」で通るのを防ぐ土台の確認。
  // チップ生成関数は温存してあり、配線し直せば下の FORBIDDEN 語が実際に出る状態にある。
  it("前提: チップ生成関数は健在で、配線すれば条件語が出る（テストが空振りでないことの確認）", () => {
    const chips = formatDirectoryDogChips(fullPolicy, "cafe").join(" ");
    expect(chips).not.toBe("");
    expect(FORBIDDEN.some((w) => chips.includes(w))).toBe(true);
  });

  it("dog_policy が全項目そろっていても、条件を示す語を一切描画しない", () => {
    const { container } = render(createElement(DirectoryPlaceCard, { place: makePlace() }));
    const text = container.textContent ?? "";
    for (const word of FORBIDDEN) {
      expect(text, `「${word}」がカードに表示されている`).not.toContain(word);
    }
  });

  it("業態を変えても条件語は出ない（宿・観光・動物病院）", () => {
    for (const category of ["accommodation", "sightseeing", "animal_hospital"] as const) {
      const { container } = render(
        createElement(DirectoryPlaceCard, { place: makePlace({ category }) })
      );
      const text = container.textContent ?? "";
      for (const word of FORBIDDEN) {
        expect(text, `[${category}]「${word}」がカードに表示されている`).not.toContain(word);
      }
    }
  });

  it("概要（施設名・カテゴリ・説明・公式サイト・最寄りルート・確認日）は従来どおり出る", () => {
    const { container } = render(createElement(DirectoryPlaceCard, { place: makePlace() }));
    const text = container.textContent ?? "";
    expect(text).toContain("テスト施設");
    expect(text).toContain("カフェ");
    expect(text).toContain("芦ノ湖のほとりに建つカフェ。");
    expect(text).toContain("公式サイトを見る");
    expect(text).toContain("テストルート");
    expect(text).toContain("2026年7月時点");
  });

  it("価格帯・営業時間も引き続き出さない（2026-07-28 の撤去の回帰）", () => {
    const { container } = render(createElement(DirectoryPlaceCard, { place: makePlace() }));
    const text = container.textContent ?? "";
    expect(text).not.toContain("￥￥");
    expect(text).not.toContain("10:00-17:00");
  });
});
