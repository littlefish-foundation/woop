import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
// @ts-ignore - these modules don't have TypeScript definitions
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
// @ts-ignore - these modules don't have TypeScript definitions
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
// @ts-ignore - these modules don't have TypeScript definitions
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      // Add polyfills for node built-ins
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
      crypto: 'crypto-browserify',
      'node-modules-polyfills:crypto': 'crypto-browserify'
    },
  },
  optimizeDeps: {
    include: ['crypto-browserify'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        // @ts-ignore - esbuild plugin without types
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        // @ts-ignore - esbuild plugin without types
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        // Enable rollup polyfills plugin
        // @ts-ignore - rollup plugin without types
        rollupNodePolyFill(),
      ],
      // Explicitly set external dependencies that should be resolved
      external: [],
    },
    // Ensure CommonJS modules are properly handled
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  root: path.resolve(__dirname, "client"),
});

