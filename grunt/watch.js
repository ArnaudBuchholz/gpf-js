"use strict";

module.exports = {
    files: configuration.srcFiles.concat(configuration.testFiles),
    // Take care of linting and maintainability (don't use concurrent to allow configuration altering)
    tasks: [
        "jshint",
        "eslint",
        "exec:plato"
    ],
    options: {
        spawn: false
    }
};
