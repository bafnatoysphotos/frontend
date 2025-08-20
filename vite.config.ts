import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",  // 👈 needed for Vercel deployment
  server: {
    port: 8082 // 👈 only affects local dev
  },
  build: {
    outDir: "dist"
  }
});
