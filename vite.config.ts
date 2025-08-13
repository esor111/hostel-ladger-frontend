import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLoc = mode === 'loc';
  return ({
    server: {
      host: "::",
      port: isLoc ? 8081 : 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ['react', 'react-dom'],
    },
    define: {
      // Fix for libraries that expect process.env to be defined
      'process.env': {},
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@radix-ui/react-tooltip'],
      exclude: ['@radix-ui/react-tooltip/dist'],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  });
});
