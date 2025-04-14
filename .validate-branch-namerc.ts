const commitizenTypes = [
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'fix',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
];
const pattern = `^((${commitizenTypes.join('|')})(\/[a-zA-Z0-9_.-]+){1,2}|changeset-release/main)$`;
export default {
  pattern,
  errorMsg: `Wrong branch name, please use pattern: ${pattern}.`,
};
