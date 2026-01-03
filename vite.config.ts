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
            // React Router - depends on React (large, split first)
            if (id.includes("react-router")) {
              return "react-router";
            }
            // TanStack Query - depends on React (large, split second)
            if (id.includes("@tanstack/react-query")) {
              return "react-query";
            }
            // React Hook Form - depends on React
            if (id.includes("react-hook-form")) {
              return "react-hook-form";
            }
            // Radix UI components - large UI library (depends on React)
            if (id.includes("@radix-ui")) {
              return "radix-vendor";
            }
            // Recharts - large charting library
            if (id.includes("recharts")) {
              return "charts-vendor";
            }
            // Supabase - backend client (independent)
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            // Date utilities (independent)
            if (id.includes("date-fns")) {
              return "date-vendor";
            }
            // Lucide icons (independent)
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            // React core (react, react-dom, scheduler) - keep together in vendor
            // This ensures React is available when other chunks need it
            // Vite will handle the loading order automatically
            return "vendor";
          }
        },
      },
    },
    // Increase chunk size warning limit to 1000kb (optional)
    chunkSizeWarningLimit: 1000,
  },
}));
