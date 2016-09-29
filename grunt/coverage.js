"use strict";

module.exports = {
    "default": {
        options: {
            thresholds: {
                statements: configuration.metrics.coverage.statements,
                branches: configuration.metrics.coverage.branches,
                lines: configuration.metrics.coverage.lines,
                functions: configuration.metrics.coverage.functions
            },
            dir: "tmp/coverage/reports"
        }
    }
};
