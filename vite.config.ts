import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // Vercel ke liye correct base
  build: {
    outDir: "dist", // Vercel expects 'dist'
  },
  server: {
    port: 3000, // sirf local dev ke liye, Vercel ignore karega
  }
});
