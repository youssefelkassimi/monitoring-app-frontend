// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000,
//     proxy: {
//       '/api': {
//         target: 'http://localhost:8000',
//         changeOrigin: true,
//       },
//     },
//   },
// });

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',   // or host: true
        port: 3000,
    },
})
