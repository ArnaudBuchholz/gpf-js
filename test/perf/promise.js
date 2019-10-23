"use strict";

const path = require('path');
global.gpfSourcesPath = path.join(__dirname, "../../src/");
require("../../src/boot");

var GpfPromise = gpf.internals._GpfPromise;

function createTest (PromiseClass) {
    return function () {
        return PromiseClass.resolve()
            .then(function () {
                return PromiseClass.all([
                    PromiseClass.resolve(),
                    PromiseClass.resolve()
                ]);
            });
    };
}

module.exports = {

    "Native promise": createTest(Promise),

    "Polyfilled promise": createTest(GpfPromise)

};
