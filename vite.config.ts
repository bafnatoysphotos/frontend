import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",   // ✅ correct for Vercel (public root)
  server: {
    port: 8082 // only affects local dev
  },
  build: {
    outDir: "dist"
  }
});
