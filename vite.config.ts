import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/auth/google/callback": {
        target: "https://agent-backend-api-88199591627.us-east4.run.app",
        changeOrigin: true,
      },
      "/api": {
        target: "https://agent-backend-api-88199591627.us-east4.run.app",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
