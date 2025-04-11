import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8", // ✅ this is the only supported provider now
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage-report",
      exclude: ["**/node_modules/**", "**/dist/**"],
    },
  },
});
