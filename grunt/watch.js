"use strict";

module.exports = {
    files: configuration.files.src.concat(configuration.files.test),
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
