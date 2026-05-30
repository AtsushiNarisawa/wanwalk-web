import { defineConfig } from "vitest/config";
import path from "node:path";

// Web 回帰テスト（W15）。is_published 整合 / 季節フィルタ / sitemap / middleware /
// feedback の退行を CI で検出する。default は node 環境、React コンポーネントの
// テストはファイル先頭の `// @vitest-environment jsdom` で個別に jsdom を指定する。
// JSX/TSX は vitest 同梱の esbuild が自動変換する（tsconfig の jsx: react-jsx 準拠）。
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts", "test/**/*.test.tsx"],
    setupFiles: ["./test/setup.ts"],
  },
});
