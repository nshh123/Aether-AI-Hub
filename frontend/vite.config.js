import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // During dev, proxy API calls to the FastAPI backend
      "/v1": "http://localhost:8000",
      "/api": "http://localhost:8000",
    },
  },
});
