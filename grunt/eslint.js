"use strict";

module.exports = {
    options: {
        rulePaths: [".eslintrules"],
        fix: true,
        quiet: true // do not show warnings
    },
    target: configuration.files.linting.js
};
