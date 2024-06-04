module.exports = function (config) {
    config.set({
        frameworks: ["ui5", "qunit", "sinon"],
        ui5: {
            url: "https://sapui5.hana.ondemand.com",
            mode: "script",
            config: {
                async: true,
                resourceRoots: {
                    "com.vesi.zfac4_valtoker": "./base/webapp"
                }
            },
            tests: [
                // "com/vesi/zfac4_valtoker/test/unit/AllTests"
            ]
        },
        preprocessors: {
            "{webapp,webapp/!(tests)}/*.js": ["coverage"]
        },

        reporters: ["coverage", "verbose"],

        coverageReporter: {
            includeAllSources: true,
            reporters: [
                { type: "text" }, // Text report (optional)
                { type: "lcov", dir: "webapp/", subdir: "test/unit/coverage/" } // lcov report
            ],
            check: {
                each: {
                    statements: 0,
                    branches: 0,
                    functions: 0,
                    lines: 0
                }
            },
        },
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--headless', '--disable-web-security']
            }
        },
        singleRun: true
    });
};
