import js from '@eslint/js';

const customRules = {
  'n/prefer-global/buffer': 'off',
  'unicorn/prevent-abbreviations': 'off',
  'space-before-function-paren': 'off',
  '@stylistic/space-before-function-paren': 'off',
  'capitalized-comments': 'off',
  'no-warning-comments': 'off',
};

const xoConfig = [{
  files: ['xo.config.js'],
  space: true,
}, {
  rules: {
    ...js.configs.recommended.rules,
    ...customRules,
  },
}];

export default xoConfig;
