import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        include: ['**/*.test.ts', '**/*.test.tsx'],
<<<<<<< HEAD
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.agent/**',
            '**/.jules_bases/**',
            '**/orchestration/**',
            '**/tmp/**',
        ],
=======
>>>>>>> pr-286
        globals: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
<<<<<<< HEAD
            'server-only': path.resolve(__dirname, './scripts/mock-server-only.js'),
=======
>>>>>>> pr-286
        },
    },
});
