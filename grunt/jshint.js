"use strict";
/*jshint node: true*/
/*eslint-env node*/
/*global configuration*/

module.exports = {
    options: {
        jshintrc: ".jshintrc"
    },
    files: configuration.jsLintedFiles.concat("make/*.json")
};
