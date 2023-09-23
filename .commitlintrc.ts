import { rules as defaultRules } from '@commitlint/config-conventional';

/**
 * Commit Lint Config
 */
const commitLintConfig = {
  extends: ['@commitlint/config-conventional'],
  helpUrl: '',
  plugins: ['commitlint-plugin-function-rules'],
  rules: {
    ...defaultRules,
    'function-rules/header-max-length': [0],
    'type-enum': [
      2,
      'always',
      ['feat', 'feature', 'fix', 'refactor', 'docs', 'build', 'test', 'ci', 'chore']
    ]
  }
};

export default commitLintConfig;
