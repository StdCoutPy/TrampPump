/// <reference types="vite/client" />

// Добавляем эту строчку, чтобы TypeScript перестал ругаться на импорт из 'vue'
declare module 'vue';

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
