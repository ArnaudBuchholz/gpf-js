"use strict";

module.exports = {
    "default": {
        options: {
            thresholds: {
                statements: 90,
                branches: 90,
                lines: 90,
                functions: 90
            },
            dir: "tmp/coverage/reports"
        }
    }
};
