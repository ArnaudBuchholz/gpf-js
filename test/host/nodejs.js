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
    },
    Timer: function () {
        this._start = process.hrtime();
        this.elapsed = function () {
            var now = process.hrtime();
            return (now[0] - this._start[0]) * 1000
          + Math.round((now[1] - this._start[1]) / 1000000);
        };
    }
});
