"use strict";
/*jshint node: true*/
/*eslint-env node*/
global.assert = require("assert");
var Mocha = require("mocha"),
    mocha = new Mocha({ui: "bdd"}),
    loadTests = require("../node_loader.js");
loadTests(function (path) {
    mocha.addFile(path);
});
// Now, you can run the tests.
mocha.run(function(failures){
    process.on("exit", function () {
        process.exit(failures);
    });
});
