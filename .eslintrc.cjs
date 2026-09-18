/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended' // Добавляем наш плагин для TS
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
    },
    rules: {
        // Правила ядра, которые мы строго соблюдаем
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-console': 'warn', // Позволить в dev, но предупредить
    }
};
