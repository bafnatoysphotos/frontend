import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // ✅ correct for Vercel
  server: {
    port: 8082 // ✅ only for local dev
  },
  build: {
    outDir: "dist"
  }
});
