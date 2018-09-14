"use strict";

describe("serial/get", function () {

    describe("gpf.serial.getProperties", function () {

        var A;

        before(function () {
            A = gpf.define({
                $class: "A",

                "[_id]": [new gpf.attributes.Serializable({
                    name: "id",
                    required: true
                })],
                _id: "",

                "[_name]": [new gpf.attributes.Serializable({
                    name: "name"
                })],
                _name: ""
            });
        });

        function _checkProperties (properties) {
            assert(Object.keys(properties).length === 2);
            assert(properties._id.name === "id");
            assert(properties._name.name === "name");
        }

        it("lists serializable properties (on class)", function () {
            _checkProperties(gpf.serial.get(A));
        });

        it("lists serializable properties (on instance)", function () {
            _checkProperties(gpf.serial.get(new A()));
        });

        it("returns an empty object if no serializable attributes", function () {
            var properties = gpf.serial.get(new Date());
            assert(Object.keys(properties).length === 0);
        });

    });

});
