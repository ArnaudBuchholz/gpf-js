"use strict";

describe("serial/query", function () {

    var Test;

    before(function () {
        Test = gpf.define({
            $class: "Test"

            "[_name]": [new gpf.attributes.Serializable({
                name: "Name"
            }],
            _name: ""

        });
    });

    it("lists serializable properties", function () {
        var properties = gpf.serial.query(Test);
        assert(properties._name);
        assert(properties._name.name === "Name");
        assert(properties._name.type === gpf.serial.types.string);
    });

});
