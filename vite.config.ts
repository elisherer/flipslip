import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
//import circleDependency from "vite-plugin-circular-dependency";
//import eslint from "vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";

const isSSL = (process.env.npm_lifecycle_script?.indexOf("--open https://") ?? -1) > -1;

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    react(),
    // eslint({
    //   include: ["src/**/*.{js,jsx,ts,tsx}"],
    //   failOnWarning: false,
    // }),
    //circleDependency(),
    isSSL ? basicSsl() : null,
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
    rolldownOptions: {
      external: ["iwer", "@iwer/devui", "@iwer/sem"],
    },
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
    host: "0.0.0.0", // exposes host to local network to be able to access site from VR headset
  },
};
