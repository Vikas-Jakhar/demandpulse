import { defineConfig } from "vitest/config";
import path from "path";

// Mirrors tsconfig.json's "@/*" path alias so test files can import
// production code the same way the app does ("@/lib/forecasting/...").
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
