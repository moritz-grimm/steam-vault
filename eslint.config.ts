import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default [
    {
        ignores: [
            "node_modules",
            "dist",
            "build",
        ],
    },
    ...tseslint.configs.recommendedTypeChecked.map(config => ({
        ...config,
        files: ["**/*.{ts,mts,cts,tsx}"],
    })),
    {
        files: ["**/*.{ts,mts,cts,tsx}"],
        languageOptions: {
            parserOptions: {
                project: true,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unused-vars': 'warn',
        },
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        ...js.configs.recommended,
        plugins: {
            stylistic,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            /* -----------------------
                Error-Linting
            ----------------------- */
            'eqeqeq': ['warn', 'always'],
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-duplicate-imports': 'warn',
            'prefer-const': 'warn',

            /* -----------------------
                Code-Styling
            ----------------------- */
            'stylistic/semi': ['warn', 'always'],
            'stylistic/indent': ['warn', 4],
            'stylistic/brace-style': ['warn', '1tbs', { allowSingleLine: true }],
            'curly': ['warn', 'multi-line'],
            'stylistic/comma-dangle': ['warn', 'always-multiline'],
            'stylistic/object-curly-spacing': ['warn', 'always'],
            'stylistic/keyword-spacing': ['warn', { before: true, after: true }],
            'stylistic/space-before-function-paren': ['warn', 'never'],
            'stylistic/no-trailing-spaces': 'warn',
            'stylistic/eol-last': ['warn', 'always'],
            'stylistic/no-multi-spaces': 'warn',
        },
    },
];
