const js = require('@eslint/js');
const globals = require('globals');
const importPlugin = require('eslint-plugin-import');
const sonarjs = require('eslint-plugin-sonarjs');

module.exports = [
    js.configs.recommended,
    importPlugin.flatConfigs.recommended,
    sonarjs.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
                ...globals.mocha
            }
        },
        rules: {
            'no-console': ['off'],
            indent: ['error', 4],
            'max-len': ['error', { code: 140 }],
            'no-multiple-empty-lines': ['error', { max: 2 }],
            'no-var': ['warn'],
            'prefer-rest-params': ['warn'],
            'vars-on-top': ['warn'],
            'no-param-reassign': ['off'],
            'no-use-before-define': ['off'],
            'newline-per-chained-call': ['off'],
            'comma-dangle': ['error', 'never'],
            'linebreak-style': ['off'],
            quotes: ['error', 'single'],
            'sonarjs/cognitive-complexity': ['error', 40],
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }]
        }
    },
    {
        linterOptions: {
            reportUnusedDisableDirectives: 'off'
        }
    }
];
