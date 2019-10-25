"use strict";

var GpfPromise = gpf.Promise;

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
