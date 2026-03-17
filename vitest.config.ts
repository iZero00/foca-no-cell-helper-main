import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/lib/**", "src/context/**", "src/App.tsx"],
      exclude: [
        "**/*.d.ts",
        "src/components/ui/**",
        "src/components/**",
        "src/hooks/**",
        "src/pages/admin/**",
        "src/pages/**",
        "src/test/**",
        "src/lib/supabase.types.ts",
        "src/**/*.test.*",
        "src/**/*.spec.*",
        "src/main.tsx",
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
