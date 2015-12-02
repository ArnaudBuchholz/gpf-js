"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

module.exports = {
    files: configuration.jsLintedFiles,
    tasks: ["jshint"]
};
