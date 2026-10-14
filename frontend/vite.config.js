import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Socket.IO requires its own proxy entry with WebSocket support.
      // Without this, socket connections in Vite dev mode hit the Vite
      // server (which doesn't handle Socket.IO) and silently fail.
      "/socket.io": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true, // enable WebSocket proxying
      },
    },
  },
});
