"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

module.exports = {
    options: {
        configFile: ".eslintrc",
        rulePaths: [".eslintrules"]
    },
    target: configuration.jsLintedFiles
};
