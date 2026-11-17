import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for server logic: route handlers, robots, sitemap, Notion sync.
// Run with `npm test`. The "@" alias mirrors tsconfig.json.
export default defineConfig({
  // tsconfig.json says jsx "preserve" because Next compiles JSX itself. Tests
  // that import a .tsx module need it compiled here instead.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Next.js resolves "server-only" itself at build time. Outside Next the
      // marker has nothing to guard, so tests load an empty module instead.
      "server-only": fileURLToPath(new URL("./src/test/server-only.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "scripts/**/*.test.mjs"],
    restoreMocks: true,
    unstubEnvs: true,
  },
});
