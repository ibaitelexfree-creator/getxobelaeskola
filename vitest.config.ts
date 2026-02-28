import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        include: ['**/*.test.ts', '**/*.test.tsx'],
        exclude: [
            ...configDefaults.exclude,
            '.jules_bases/**',
            '.agent/**',
            '.openclaw/**',
            '**/.jules_bases/**',
            '**/.agent/**'
        ],
        globals: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'server-only': path.resolve(__dirname, './scripts/mock-server-only.js'),
        },
    },
});
