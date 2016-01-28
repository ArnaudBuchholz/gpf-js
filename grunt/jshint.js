"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

module.exports = {
    options: {
        jshintrc: true
    },
    files: configuration.jsLintedFiles.concat("make/*.json")
};
