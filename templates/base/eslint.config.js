import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...typescriptEslint.configs.recommended,
    {
        languageOptions: {
            parser: typescriptEslint.parser,
            parserOptions: {
                projectService: true,
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint.plugin,
        },
    },
    {
        plugins: {
            prettier: eslintPluginPrettier,
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },
    eslintConfigPrettier,
    {
        ignores: [
            '**/node_modules/**',
            'example/**',
            'packages/**',
            '.vscode/**',
            '*.config.js',
        ],
    },
];
