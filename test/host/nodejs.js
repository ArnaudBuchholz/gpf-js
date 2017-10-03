"use strict";

var path = require("path"),
    fs = require("fs");
require("./loader.js"); /*global loadGpfAndTests*/

loadGpfAndTests({
    parameters: process.argv.slice(2),
    gpfPath: path.resolve(__dirname, "../.."),
    pathSeparator: path.sep,
    log: console.log.bind(console),
    exit: process.exit,
    require: require,
    read: function (filePath) {
        return fs.readFileSync(filePath).toString();
    },
    config: {
        timerResolution: 5 // Seems to be less tolerant to heavy loads
    }
});
