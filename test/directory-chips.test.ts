import { describe, it, expect } from "vitest";
import { formatDirectoryDogChips } from "@/lib/walks/directory-groups";
import type { DirectoryDogPolicy } from "@/types/directory";

// 2026-08-02 箱根DMO14施設 点検 第4章(1)(2) の再発防止。
// 「テラス席」の語が飲食・物販以外に漏れないこと、サイズを推測で断定しないことを固定する。

const base: DirectoryDogPolicy = { status: "conditional" };

describe("formatDirectoryDogChips — 同伴場所の語彙は業態で変わる", () => {
  it("飲食（cafe / restaurant）だけが『テラス』の語を使う", () => {
    const outdoorOnly = { ...base, size: "all" as const, indoor: false, terrace: true };
    expect(formatDirectoryDogChips(outdoorOnly, "cafe")).toContain("テラスのみ");
    expect(formatDirectoryDogChips(outdoorOnly, "restaurant")).toContain("テラスのみ");

    const both = { ...base, size: "all" as const, indoor: true, terrace: true };
    expect(formatDirectoryDogChips(both, "cafe")).toContain("店内・テラスOK");
  });

  it("観光・温泉・足湯・ドッグランには『テラス』も『店内』も出さない", () => {
    const outdoorOnly = { ...base, size: "all" as const, indoor: false, terrace: true };
    for (const c of ["sightseeing", "onsen", "footbath", "dog_run"] as const) {
      const chips = formatDirectoryDogChips(outdoorOnly, c);
      expect(chips).toContain("屋外エリアのみ");
      expect(chips.join(" ")).not.toMatch(/テラス|店内/);
    }

    // 美術館・水族館のように屋内へ入れるケースも「店内」とは呼ばない。
    const indoorOk = { ...base, size: "small_only" as const, indoor: true, terrace: true };
    const chips = formatDirectoryDogChips(indoorOk, "sightseeing");
    expect(chips).toContain("屋内も同伴可");
    expect(chips.join(" ")).not.toMatch(/テラス|店内/);
  });

  it("宿は客室／屋外の語彙のまま（回帰）", () => {
    const both = { ...base, size: "all" as const, indoor: true, terrace: true };
    expect(formatDirectoryDogChips(both, "accommodation")).toContain("客室・屋外OK");
    const outdoorOnly = { ...base, indoor: false, terrace: true };
    expect(formatDirectoryDogChips(outdoorOnly, "accommodation")).toContain("屋外スペースOK");
  });
});

describe("formatDirectoryDogChips — サイズは断定しない", () => {
  it("'all' は犬種ではなくサイズの上限として表示する", () => {
    const chips = formatDirectoryDogChips({ ...base, size: "all" }, "accommodation");
    expect(chips).toContain("大型犬も可");
    expect(chips.join(" ")).not.toContain("全犬種");
  });

  it("'unknown' は黙って消さず『要確認』として見せる", () => {
    expect(formatDirectoryDogChips({ ...base, size: "unknown" }, "sightseeing")).toContain(
      "サイズは要確認"
    );
    // size キー自体が無い場合も同じ（欠損＝制限なし、にしない）。
    expect(formatDirectoryDogChips({ ...base }, "cafe")).toContain("サイズは要確認");
  });

  it("size_note があればバケットより優先して上限をそのまま出す", () => {
    const chips = formatDirectoryDogChips(
      { ...base, size: "unknown", size_note: "30kg以下" },
      "sightseeing"
    );
    expect(chips).toContain("30kg以下");
    expect(chips.join(" ")).not.toContain("サイズは要確認");

    // 'all' が残っていても size_note が勝つ（データ移行途中でも誤った断定を出さない）。
    const overridden = formatDirectoryDogChips(
      { ...base, size: "all", size_note: "一部客室は大型犬不可" },
      "accommodation"
    );
    expect(overridden).toContain("一部客室は大型犬不可");
    expect(overridden.join(" ")).not.toContain("大型犬も可");
  });

  it("動物病院にはサイズのチップを出さない", () => {
    const chips = formatDirectoryDogChips({ ...base, size: "unknown" }, "animal_hospital");
    expect(chips.join(" ")).not.toMatch(/サイズ|大型犬|小型犬|中型犬/);
  });
});

describe("formatDirectoryDogChips — その他の回帰", () => {
  it("dog_policy が無ければ何も出さない", () => {
    expect(formatDirectoryDogChips(null, "cafe")).toEqual([]);
    expect(formatDirectoryDogChips(undefined, "cafe")).toEqual([]);
  });

  it("リード・キャリー・料金は true / 非空のときだけ出る", () => {
    const chips = formatDirectoryDogChips(
      { ...base, size: "all", leash_required: true, carrier_required: true, dog_fee: "1頭 300円" },
      "sightseeing"
    );
    expect(chips).toEqual(["大型犬も可", "リード必須", "キャリー必須", "ペット料金あり"]);

    const none = formatDirectoryDogChips(
      { ...base, size: "all", leash_required: null, carrier_required: false, dog_fee: "  " },
      "sightseeing"
    );
    expect(none).toEqual(["大型犬も可"]);
  });
});
