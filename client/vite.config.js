import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const proxy = {
    "/api": {
      target: env.VITE_PROXY_TARGET || "http://localhost:4000",
      changeOrigin: true,
    },
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: { proxy },
    preview: { proxy },
  };
});
