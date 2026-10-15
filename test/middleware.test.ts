import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

// /spots /routes /areas の 301（RENAMED）/ 410（GONE・非ASCII・過長）/ pass-through を固定。

function run(pathname: string) {
  return middleware(new NextRequest(new URL(pathname, "https://wanwalk.jp")));
}

describe("middleware 301/410", () => {
  it("GONE スポット → 410", () => {
    expect(run("/spots/buna-no-mori").status).toBe(410);
    // 2026-10-13 鶴岡八幡宮の境内 spot を削除
    expect(run("/spots/tsurugaoka-hachimangu").status).toBe(410);
    expect(run("/spots/hataage-benzaiten-shrine").status).toBe(410);
  });

  it("RENAMED スポット → 301 で新 slug へ", () => {
    const r = run("/spots/odawara-shiro-tenshukaku");
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toContain("/spots/odawara-jo-tenshukaku");
    // 2026-10-15 井の頭池周遊コースのルート型化で削除した「七井橋（ゴール）」
    const r2 = run("/spots/nanai-kyo");
    expect(r2.status).toBe(301);
    expect(r2.headers.get("location")).toContain("/spots/nanai-kyo-tokyo-inokashira");
  });

  it("RENAMED ルート → 301 で新 slug へ", () => {
    const r = run("/routes/yokohama-sankeien-honmoku-promenade");
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toContain("/routes/yokohama-honmoku-park-hasseiden");
  });

  it("非ASCII slug → 410", () => {
    expect(run("/spots/" + encodeURIComponent("日本語スポット")).status).toBe(410);
  });

  it("100文字超の slug → 410", () => {
    expect(run("/spots/" + "a".repeat(101)).status).toBe(410);
  });

  it("通常 slug は pass-through（301/410 ではない）", () => {
    const r = run("/spots/inamuragasaki");
    expect(r.status).not.toBe(410);
    expect(r.status).not.toBe(301);
  });

  it("GONE/RENAMED は spots セグメント限定（/routes の同名 slug は 410 にしない）", () => {
    expect(run("/routes/buna-no-mori").status).not.toBe(410);
  });

  it("対象外パス（/about）は素通り", () => {
    expect(run("/about").status).not.toBe(410);
  });
});
