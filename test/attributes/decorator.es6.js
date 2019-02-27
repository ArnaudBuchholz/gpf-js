"use strict";

describe("attributes/decorator.es6", function () {

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

    describe("Defining attributes on an ES6 class using decorators", function () {

        var
            Attribute,
            Test,
            SubclassOfTest;

        before(function (done) {
            gpf.require.configure({
                clearCache: true
            });
            gpf.require.define({
                classes: "es6/class_with_attributes.js"
            }, function (require) {

                Attribute = require.classes.Attribute;
                Test = require.classes.Test;
                SubclassOfTest = require.classes.SubclassOfTest;
                done();

            }).then(undefined, done);
        });

        it("offers decorators to add attributes on class", function () {
            var attributes = gpf.attributes.get(Test);
            assert(Object.keys(attributes).length === 2);
            assert(attributes.id.length === 1);
            assert(attributes.id[0] instanceof Attribute);
            assert(attributes.id[0].value === 1);
            assert(attributes.reset.length === 1);
            assert(attributes.reset[0] instanceof Attribute);
            assert(attributes.reset[0].value === 2);
        });

        it("works on sub classes", function () {
            var subclassAttributes = gpf.attributes.get(SubclassOfTest);
            assert(Object.keys(subclassAttributes).length === 2);
            assert(subclassAttributes.id.length === 1);
            assert(subclassAttributes.reset.length === 2);
            var sum = 0;
            subclassAttributes.reset.forEach(function (attribute) {
                assert(attribute instanceof Attribute);
                assert(attribute.value === 2 || attribute.value === 3);
                sum += attribute.value;
            });
            assert(sum === 5);
        });

    });

});
