"use strict";

module.exports = {
    files: ["src/sources.json", "src/**/*.js", "test/**/*.js"],
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
