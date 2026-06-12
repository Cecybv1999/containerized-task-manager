module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',  // entry point — just starts the server
    '!src/db/index.js', // integration-tested via CI postgres, mocked in unit tests
  ],
  testTimeout: 10000,
};
