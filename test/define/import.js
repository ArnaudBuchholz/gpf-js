"use strict";

describe("define/import", function () {

    describe("Legacy class syntax", function () {

        function MyAbstractClass () {
        }

        MyAbstractClass.prototype = {
            $attribute: [],
            $abstract: true
        };

        it ("supports legacy class definition", function () {
            gpf.define.import(MyClass);


        });

    });

    if (gpf.host() === gpf.hosts.nodejs) {

        describe("ES6 class syntax", function () {

            gpf.require.configure({
                base: "test/define"
            });
            gpf.require.define({
                tests: "import.es6.js"
            });

        });

    }

});
