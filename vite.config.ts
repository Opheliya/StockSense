import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'force-javascript-mime',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Forcefully override broken Windows MIME assignments 
          if (req.url && (req.url.endsWith('.tsx') || req.url.endsWith('.ts') || req.url.endsWith('.jsx'))) {
            res.setHeader('Content-Type', 'application/javascript');
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
