"use strict";

global.assert = require("assert");
var Mocha = require("mocha"),
    mocha = new Mocha({ui: "bdd", ignoreLeaks: false, globals: "test"}),
    path = require("path"),
    fs = require("fs");

require("../loader.js"); /*global loadGpfAndTests*/

loadGpfAndTests({
    parameters: process.argv.slice(2),
    gpfPath: path.resolve(__dirname, "../../.."),
    pathSeparator: path.sep,
    log: console.log.bind(console),
    exit: process.exit,
    require: require,
    read: function (filePath) {
        return fs.readFileSync(filePath).toString();
    },
    loadTest: function (filePath) {
        mocha.addFile(filePath);
    },
    run: function () {
        // Now, you can run the tests.
        mocha.run(function (failures) {
            process.on("exit", function () {
                process.exit(failures);
            });
        });
    },
    config: {
        timerResolution: 5 // Seems to be less tolerant to heavy loads
    }
});
