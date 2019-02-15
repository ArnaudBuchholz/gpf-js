"use strict";

describe("attributes.es6", function () {

    var basePath;

    before(function () {
        if (gpf.host() === gpf.hosts.browser) {
            if (config.httpPort === 0) {
                // published version
                basePath = "/gpf/test-resources/require";
            } else {
                // local version
                basePath = "/test/require";
            }
        } else {
            // Execution path is always the root folder of the project
            basePath = "test/require";
        }
        gpf.require.configure({
            base: basePath
        });
    });

    describe("Defining attributes on an ES6 class through gpf.require.define", function () {

        beforeEach(function () {
            gpf.require.configure({
                clearCache: true
            });
        });

        it("loads js file defining a class with attributes", function (done) {
            gpf.require.define({
                classes: "es6/class_with_attributes.js"
            }, function (require) {

                var
                    Attribute = require.classes.Attribute,
                    Test = require.classes.Test;

                var attributes = gpf.attributes.get(Test);
                assert(Object.keys(attributes).length === 1);
                assert(attributes.id.length === 1);
                assert(attributes.id[0] instanceof Attribute);
                assert(attributes.id[0].value === 1);

                done();

            }).then(undefined, done);
        });

    });

});
