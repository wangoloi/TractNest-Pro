import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'utils-vendor': ['react-toastify', 'jspdf', 'jspdf-autotable'],
          // Feature chunks
          'admin-features': [
            './src/features/admin/components/UserManagement.jsx',
            './src/features/admin/components/AccessControl.jsx',
            './src/features/admin/components/admin/AdminManagement.jsx'
          ],
          'sales-features': [
            './src/features/sales/components/SalesManager.jsx',
            './src/features/sales/components/UserSalesManager.jsx',
            './src/features/sales/components/SalesPlus.jsx'
          ],
          'owner-features': [
            './src/components/owner/OwnerDashboard.jsx',
            './src/components/owner/OrganizationsManagement.jsx',
            './src/components/owner/EnterpriseUsers.jsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    sourcemap: false, // Disable sourcemaps for production
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger']
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'react-toastify'
    ]
  }
})

