"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

module.exports = {
    options: {
        rulePaths: [".eslintrules"]
    },
    target: configuration.jsLintedFiles
};
