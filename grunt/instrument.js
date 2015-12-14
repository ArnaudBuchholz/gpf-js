"use strict";
/*jshint node: true*/
/*eslint-env node*/

module.exports = {
    files: "src/**/*.js",
    options: {
        lazy: true,
        debug: true,
        noCompact: true,
        noAutoWrap: true,
        basePath: "tmp/coverage/instrument/"
    }
};
