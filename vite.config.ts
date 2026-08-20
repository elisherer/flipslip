import react from "@vitejs/plugin-react-swc";
import path from "node:path";
//import circleDependency from "vite-plugin-circular-dependency";
//import eslint from "vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    react(),
    // eslint({
    //   include: ["src/**/*.{js,jsx,ts,tsx}"],
    //   failOnWarning: false,
    // }),
    //circleDependency(),
    VitePWA({
      injectRegister: "auto",
      registerType: "autoUpdate",
      manifest: false,
      injectManifest: {
        maximumFileSizeToCacheInBytes: 16000000,
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 16000000,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  define: {
    "import.meta.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    chunkSizeWarningLimit: 1700,
    // rolldownOptions: {
    //   output: {
    //     codeSplitting: {
    //       groups: [
    //         {
    //           name(moduleId: string) {
    //             if (moduleId.includes("node_modules/")) return "vendor";
    //             return null;
    //           },
    //         },
    //       ],
    //     },
    //   },
    // },
  },
  server: {
    port: 3080,
  },
};
