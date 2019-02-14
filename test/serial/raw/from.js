"use strict";

describe("serial/raw/from", function () {

    describe("gpf.serial.fromRaw", function () {

        var A;

        before(function () {
            A = gpf.define({
                $class: "A",

                "[_id]": [new gpf.attributes.Serializable({
                    name: "id",
                    required: true,
                    readOnly: true
                })],
                _id: "",

                "[_name]": [new gpf.attributes.Serializable({
                    name: "name"
                })],
                _name: "",

                "[_created]": [new gpf.attributes.Serializable({
                    name: "created",
                    type: gpf.serial.datetime,
                    readOnly: true
                })],
                _created: null,

                "[_modified]": [new gpf.attributes.Serializable({
                    name: "modified",
                    type: gpf.serial.datetime
                })],
                _modified: null
            });
        });

        [
            undefined,
            null,
            0,
            1,
            false,
            true,
            "",
            "Hello World",
            function () {}

        ].forEach(function (value) {
            it("fails if the first parameter is not correct (" + JSON.stringify(value) + ")", function () {
                var exceptionCaught;
                try {
                    gpf.serial.fromRaw(value, {});
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
            });
        });

        it("initializes the instance from the object containing the serializable properties", function () {
            var a = new A(),
                result = gpf.serial.fromRaw(a, {
                    id: "id",
                    name: "Test"
                });
            assert(a === result);
            assert(a._id === ""); // read-only
            assert(a._name === "Test");
        });

        it("converts properties' value", function () {
            var a = new A();
            gpf.serial.fromRaw(a, {
                id: "ID",
                name: undefined, // HasOwnProperty but value is undefined
                modified: "2018-09-19T12:50:12.000Z"
            }, function (value, property, member) {
                /*jshint validthis:true*/
                assert(this === a); //eslint-disable-line no-invalid-this
                if (member === "_id") {
                    assert(property.name === "id");
                    assert(property.readOnly === true);
                    assert(value === "ID");
                    return "id"; // Will set the property anyway
                } else if (member === "_name") {
                    assert(property.name === "name");
                    assert(property.readOnly === false);
                    assert(value === undefined);
                    return "Test";
                } else if (member.type === gpf.serial.datetime) {
                    assert(member === "_modified");
                    return new Date(value);
                }
                // no _created
                assert(false);
            });
            assert(a._id === "id");
            assert(a._name === "Test");
            assert(a._modified.getUTCFullYear() === 2018);
            assert(a._modified.getUTCMonth() === 8);
            assert(a._modified.getUTCDate() === 19);
            assert(a._modified.getUTCHours() === 12);
            assert(a._modified.getUTCMinutes() === 50);
            assert(a._modified.getUTCSeconds() === 12);
        });

    });

});

if (config.features.propertydescriptor) {

    include("serial/raw/from.propertydescriptor");

}
