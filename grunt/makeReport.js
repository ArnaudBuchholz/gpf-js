"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = {
    src: "tmp/coverage/reports/**/*.json",
    options: {
        type: "lcov",
        dir: "tmp/coverage/reports",
        print: ""
    }
};
