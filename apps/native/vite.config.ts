import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// Build-time environment detection
// Priority: APP_ENV > NODE_ENV > default to 'production'
const appEnv = process.env.APP_ENV || process.env.NODE_ENV || 'production';
const isDevelopment = appEnv === 'development';
const isStaging = appEnv === 'staging';
const isProduction = appEnv === 'production';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  // Define global constants for build-time environment detection
  define: {
    __APP_ENV__: JSON.stringify(appEnv),
    __IS_DEVELOPMENT__: JSON.stringify(isDevelopment),
    __IS_STAGING__: JSON.stringify(isStaging),
    __IS_PRODUCTION__: JSON.stringify(isProduction),
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
