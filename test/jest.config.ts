import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../app/v1/src',                        // Update to match your folder structure
  testRegex: '.*\\.spec\\.ts$',             // Looks for .spec.ts files
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',             // Use ts-jest for transpiling
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};

export default config;
