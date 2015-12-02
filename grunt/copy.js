"use strict";
/*jshint node: true*/
/*eslint-env node*/

/*eslint-disable no-sync*/

var IO_PATH = "../ArnaudBuchholz.github.io",
    fs = require("fs"),
    copy = {
        getPlatoHistory: {}
    };

if (fs.existsSync(IO_PATH)) {
    copy.getPlatoHistory = {
        expand: true,
        flatten: true,
        src: IO_PATH + "/plato/gpf-js/report.history.*",
        dest: "./tmp/plato/"
    };
}

module.exports = copy;
