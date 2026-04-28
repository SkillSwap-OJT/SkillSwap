import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certDir = path.resolve(__dirname, "certs");
const httpsEnabled =
  fs.existsSync(path.join(certDir, "dev-key.pem")) &&
  fs.existsSync(path.join(certDir, "dev-cert.pem"));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    https: httpsEnabled
      ? {
          key: fs.readFileSync(path.join(certDir, "dev-key.pem")),
          cert: fs.readFileSync(path.join(certDir, "dev-cert.pem")),
        }
      : undefined,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5001",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
