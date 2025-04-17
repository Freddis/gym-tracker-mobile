// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['/dist/*'],
  env: {
    browser: true,
    jest: true,
  },
  rules: {
    'array-bracket-spacing': [2, 'never'],
    'arrow-spacing': 2,
    'block-spacing': [2, 'never'],
    'brace-style': [2, '1tbs', {allowSingleLine: true}],
    'camelcase': [2, {properties: 'never', ignoreDestructuring: true}],
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    'comma-spacing': [2, {before: false, after: true}],
    'comma-style': [2, 'last'],
    'computed-property-spacing': [2, 'never'],
    'consistent-this': [2, 'self'],
    'constructor-super': 2,
    'curly': [2, 'multi-line', 'consistent'],
    'default-case': 2,
    'dot-location': [2, 'property'],
    'dot-notation': [2],
    'eol-last': 2,
    'eqeqeq': [2, 'allow-null'],
    'guard-for-in': 2,
    'indent-legacy': [2, 2, {SwitchCase: 1}],
    'jsx-quotes': [2, 'prefer-double'],
    'key-spacing': [2, {beforeColon: false, afterColon: true}],
    'keyword-spacing': [2, {before: true, after: true, overrides: {}}],
    'linebreak-style': [2, 'unix'],
    'max-len': [2, 130, 2],
    'new-cap': [2, {capIsNew: false, newIsCap: true}],
    'new-parens': 2,
    // 'no-alert': 2,
    'no-array-constructor': 2,
    'no-bitwise': 2,
    'no-caller': 2,
    'no-case-declarations': 2,
    'no-class-assign': 2,
    'no-cond-assign': 2,
    'no-console': 0,
    'no-const-assign': 2,
    'no-constant-condition': 2,
    'no-debugger': 2,
    'no-delete-var': 2,
    'no-dupe-args': 2,
    'no-dupe-class-members': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-duplicate-imports': 2,
    'no-empty': 2,
    'no-empty-character-class': 2,
    // 'no-empty-function': 2,
    'no-empty-pattern': 2,
    'no-eval': 2,
    'no-ex-assign': 2,
    'no-extend-native': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': 0,
    'no-fallthrough': 2,
    'no-floating-decimal': 2,
    'no-func-assign': 2,
    'no-implied-eval': 2,
    'no-inner-declarations': 2,
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-iterator': 2,
    'no-lone-blocks': 2,
    'no-lonely-if': 0,
    'no-loop-func': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multi-spaces': ['error', {ignoreEOLComments: true}],
    'no-multi-str': 2,
    'no-multiple-empty-lines': 2,
    'no-native-reassign': 2,
    'no-negated-in-lhs': 2,
    'no-new': 2,
    'no-new-func': 2,
    'no-new-object': 2,
    'no-new-wrappers': 2,
    'no-obj-calls': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-plusplus': 0,
    'no-proto': 2,
    'no-regex-spaces': 2,
    'no-return-assign': 2,
    'no-script-url': 2,
    'no-self-assign': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-shadow': 0,
    'no-shadow-restricted-names': 2,
    'no-spaced-func': 2,
    'no-sparse-arrays': 2,
    'no-this-before-super': 2,
    'no-throw-literal': 2,
    'no-trailing-spaces': 2,
    'no-undef': 2,
    'no-undef-init': 2,
    'no-undefined': 0,
    'no-underscore-dangle': 0,
    'no-unexpected-multiline': 2,
    'no-unmodified-loop-condition': 2,
    'no-unneeded-ternary': [2, {defaultAssignment: false}],
    'no-unreachable': 2,
    'no-unsafe-finally': 2,
    'no-unused-expressions': [2, {allowShortCircuit: true, allowTernary: true}],
    'no-unused-vars': 'off',
    'no-useless-call': 2,
    'no-useless-computed-key': 2,
    'no-useless-concat': 2,
    'no-useless-constructor': 2,
    'no-useless-escape': 2,
    'no-useless-rename': 2,
    'no-var': 2,
    'no-void': 2,
    'no-warning-comments': [0, {terms: ['todo', 'fixme']}],
    'no-whitespace-before-property': 2,
    'no-with': 2,
    'object-curly-spacing': [2, 'never'],
    'prefer-rest-params': 2,
    'prefer-spread': 2,
    'quote-props': [2, 'consistent-as-needed'],
    'quotes': [2, 'single', 'avoid-escape'],
    'radix': 2,
    'rest-spread-spacing': 2,
    'semi': [2, 'always'],
    'semi-spacing': [2, {before: false, after: true}],
    'space-before-blocks': [2, 'always'],
    'space-before-function-paren': [2, {anonymous: 'never', named: 'never', asyncArrow: 'always'}],
    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,
    'space-unary-ops': [2, {words: true, nonwords: false}],
    'strict': [2, 'never'],
    'template-curly-spacing': 2,
    'use-isnan': 2,
    'valid-typeof': 2,
    'vars-on-top': 2,
    'wrap-iife': [2, 'inside'],
    'yoda': 2,
    'arrow-parens': [2, 'always'],
    // Node.js specific
    'handle-callback-err': [2, '^(err|error)$'],
    'no-mixed-requires': 2,
    'no-new-require': 2,
    'no-path-concat': 2,
    // Import
    'import/default': 0,
    'import/export': 2,
    'import/imports-first': 2,
    'import/namespace': 2,
    // React
    'react/jsx-uses-react': 'error',
    'react/jsx-indent-props': 'off',
  },
};
