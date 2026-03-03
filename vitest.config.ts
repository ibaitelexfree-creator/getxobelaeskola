import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts',
        include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        exclude: [
            ...configDefaults.exclude,
            '**/node_modules/**',
            '**/dist/**',
            '**/.jules_bases/**',
            '**/.agent/**',
            '**/.Jules/**',
            '**/.openclaw/**',
            '**/scripts/**',
            'apps/**'
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
