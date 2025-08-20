import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",   // 👈 Needed so assets resolve correctly
  build: {
    outDir: "dist"
  }
});
