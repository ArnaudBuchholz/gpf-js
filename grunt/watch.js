"use strict";

module.exports = {
    files: configuration.srcFiles.concat(configuration.testFiles),
    // Take care of linting and maintainability
    tasks: [
        "eslint",
        "exec:plato"
    ]
};
