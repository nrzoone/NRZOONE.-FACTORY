import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: '/',
    plugins: [react()],
    server: {
        port: 3333,
        open: true
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'vendor-react';
                        if (id.includes('lucide-react')) return 'vendor-icons';
                        if (id.includes('firebase')) return 'vendor-firebase';
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})
