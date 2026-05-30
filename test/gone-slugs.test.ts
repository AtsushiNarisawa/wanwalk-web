import { describe, it, expect } from "vitest";
import { GONE_SPOT_SLUGS, RENAMED_SPOT_SLUGS } from "@/lib/gone-slugs";

// gone-slugs の不変条件。過去に「健康な viewpoint 新 slug を持つ 2件が GONE に振られていた」
// （2026-05-17）や「301→404 redirect chain」（2026-05-07）といった事故があった。
// これらを構造的に再発させないための回帰テスト。

const SLUG = /^[a-z0-9][a-z0-9_-]*$/;

describe("gone-slugs invariants", () => {
  it("RENAMED の旧 slug は GONE に含まれない（二重分類なし）", () => {
    const bad = [...RENAMED_SPOT_SLUGS.keys()].filter((k) => GONE_SPOT_SLUGS.has(k));
    expect(bad).toEqual([]);
  });

  it("RENAMED の遷移先（新 slug）は GONE に含まれない（301→410 chain なし）", () => {
    const bad = [...RENAMED_SPOT_SLUGS.values()].filter((v) => GONE_SPOT_SLUGS.has(v));
    expect(bad).toEqual([]);
  });

  it("RENAMED の遷移先が別の RENAMED の旧 slug になっていない（多段 redirect なし）", () => {
    const keys = new Set(RENAMED_SPOT_SLUGS.keys());
    const bad = [...RENAMED_SPOT_SLUGS.values()].filter((v) => keys.has(v));
    expect(bad).toEqual([]);
  });

  it("自己 redirect（旧==新）が無い", () => {
    const bad = [...RENAMED_SPOT_SLUGS.entries()].filter(([k, v]) => k === v);
    expect(bad).toEqual([]);
  });

  it("全 gone/renamed slug は ASCII slug 規約（middleware の VALID_SLUG と同一）に適合", () => {
    const all = [
      ...GONE_SPOT_SLUGS,
      ...RENAMED_SPOT_SLUGS.keys(),
      ...RENAMED_SPOT_SLUGS.values(),
    ];
    const bad = all.filter((s) => !SLUG.test(s) || s.length > 100);
    expect(bad).toEqual([]);
  });

  it("非公開ルート配下 viewpoint 14 slug（2026-05-29 W1）が 410 化されている", () => {
    const nonPublic = [
      "buna-no-mori",
      "kintoki-jinja-fukin",
      "choja-ke-saki-no-sunahama",
      "chojagasaki-kaigan",
      "chojagasaki-tembo-pointo",
      "kyukei-benchi",
      "ohama-kaigan-yuhodo",
      "isshoku-kaigan-no-sunahama",
      "morito-dai-myojin",
      "morito-kaigan",
      "ike-no-oku-gawa",
      "kaede-namiki-no-yuhodo",
      "kumo-ba-ike-no-mizukagami",
      "kumo-jo-chi-suimen-no-utsuri-komi",
    ];
    const missing = nonPublic.filter((s) => !GONE_SPOT_SLUGS.has(s));
    expect(missing).toEqual([]);
  });
});
