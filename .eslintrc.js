module.exports = {
  root: true,
  extends: '@react-native',
  ignorePatterns: ['android/', 'ios/', 'coverage/', 'node_modules/'],
  rules: {
    // Reglas obligatorias del proyecto (CLAUDE.md)
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': 'error',
    'react-native/no-inline-styles': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-duplicate-imports': 'error',
  },
};
