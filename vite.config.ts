import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue'; // Импортируем официальный плагин Vue
import path from 'path';

export default defineConfig({
  plugins: [
    // Здесь должны быть плагины для нашего движка/ядра, возможно, собственный Rollup plugin
    // Если это чистый JS фундамент:
    vue() // Подключаем плагин для сборки .vue файлов

  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3000,
    // Корневой каталог для запуска игры/приложения
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    minify: 'esbuild', // Высокопроизводительное минифицирование
    sourcemap: false, // В продакшне отключаем для чистой сборки
  },
});
