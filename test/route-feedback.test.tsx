// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// W6 回帰ガード: supabase-js の insert は失敗時に throw せず { error } を返すため、
// error を確認せずサイレントに「送信完了」表示になる退行を防ぐ。
// insert が { error } を返したら alert を出し、サンクスメッセージは出さないことを固定。

const insertMock = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: () => ({ insert: insertMock }) }),
}));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

import RouteFeedback from "@/components/walks/RouteFeedback";

beforeEach(() => {
  insertMock.mockReset();
});

async function openAndSubmit(text: string) {
  fireEvent.click(screen.getByText("情報の修正を提案する"));
  fireEvent.change(screen.getByPlaceholderText(/駐車場は現在/), {
    target: { value: text },
  });
  fireEvent.click(screen.getByText("送信する"));
}

describe("RouteFeedback (W6)", () => {
  it("insert が error を返したら alert・サンクス表示はしない", async () => {
    insertMock.mockResolvedValue({ error: { message: "RLS denied" } });
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<RouteFeedback routeId="r1" routeSlug="s1" />);

    await openAndSubmit("駐車場が値上げされています");

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    expect(screen.queryByText(/ご報告ありがとうございます/)).toBeNull();
  });

  it("insert 成功でサンクスメッセージを表示", async () => {
    insertMock.mockResolvedValue({ error: null });
    render(<RouteFeedback routeId="r1" routeSlug="s1" />);

    await openAndSubmit("駐車場が値上げされています");

    await waitFor(() =>
      expect(screen.getByText(/ご報告ありがとうございます/)).toBeTruthy(),
    );
  });
});
