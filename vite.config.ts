import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into separate chunks for better caching
          if (id.includes("node_modules")) {
            // React and React DOM - core framework
            if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
              return "react-vendor";
            }
            // React Router - routing library
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            // TanStack Query - data fetching
            if (id.includes("@tanstack/react-query")) {
              return "query-vendor";
            }
            // Supabase - backend client
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            // Radix UI components - UI library (large)
            if (id.includes("@radix-ui")) {
              return "radix-vendor";
            }
            // Recharts - charting library (large)
            if (id.includes("recharts")) {
              return "charts-vendor";
            }
            // Date utilities
            if (id.includes("date-fns")) {
              return "date-vendor";
            }
            // Lucide icons
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            // Other vendor libraries
            return "vendor";
          }
        },
      },
    },
    // Increase chunk size warning limit to 1000kb (optional)
    chunkSizeWarningLimit: 1000,
  },
}));
