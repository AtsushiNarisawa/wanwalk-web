"use client";

/**
 * ホテルQR（?ref=<utm_slug>）からの着地を 1 回だけ GA4 へ送る。
 * どの施設の QR が来訪を生んだかを把握する（インバウンド計測）。表示は無し。
 */
import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export default function DirectoryRefTracker({ refSlug }: { refSlug: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !refSlug) return;
    fired.current = true;
    trackEvent("directory_qr_landing", { ref: refSlug, surface: "hakone_dogmap" });
  }, [refSlug]);
  return null;
}
