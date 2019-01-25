"use strict";

/*jshint esversion: 6 */
/*eslint-env es6*/

describe("isclass.es6", function () {

    class A {
    }

    describe("gpf.isclass", function () {

        it("recognizes ES6 classes", function () {
            assert(gpf.isClass(A));
        });

    });

});
