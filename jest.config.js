module.exports = {
    setupFilesAfterEnv: ['./rtl.setup.js'],
    verbose: true,
    moduleDirectories: ['node_modules'],
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,jsx}'],
    transformIgnorePatterns: ['node_modules/(?!(proton-shared)/)']
};
