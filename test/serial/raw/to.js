"use strict";

describe("serial/raw/to", function () {

    describe("gpf.serial.toRaw", function () {

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
                _name: "",

                "[_created]": [new gpf.attributes.Serializable({
                    name: "created",
                    type: gpf.serial.datetime
                })],
                _created: null,

                "[_modified]": [new gpf.attributes.Serializable({
                    name: "modified",
                    type: gpf.serial.datetime
                })],
                _modified: null,

                constructor: function (id, name, modified) {
                    this._id = id;
                    this._name = name;
                    this._created = new Date();
                    this._modified = modified || null;
                }
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
            it("fails if the parameter is not correct (" + JSON.stringify(value) + ")", function () {
                var exceptionCaught;
                try {
                    gpf.serial.toRaw(value);
                } catch (e) {
                    exceptionCaught = e;
                }
                assert(exceptionCaught instanceof gpf.Error.InvalidParameter);
            });
        });

        it("generates an object containing only the serializable properties", function () {
            var a = new A("id", "Test"),
                raw = gpf.serial.toRaw(a);
            assert(Object.keys(raw).length === 4);
            assert(raw.id === "id");
            assert(raw.name === "Test");
        });

        it("converts properties' value", function () {
            var a = new A("id", "Test", new Date(Date.UTC(2018, 8, 19, 12, 50, 12, 0))),
                raw = gpf.serial.toRaw(a, function (value, property, member) {
                    /*jshint validthis:true*/
                    assert(this === a); //eslint-disable-line no-invalid-this
                    if (member === "_id") {
                        assert(property.name === "id");
                        assert(value === "id");
                        return "ID";
                    } else if (member === "_name") {
                        assert(property.name === "name");
                        assert(value === "Test");
                        return "TEST";
                    } else if (member.type === gpf.serial.datetime) {
                        assert(member === "_created" || member === "_modified");
                        return value.toISOString();
                    }
                    assert(false);
                });
            assert(Object.keys(raw).length === 4);
            assert(raw.id === "ID");
            assert(raw.name === "TEST");
            assert(raw.modified === "2018-09-19T12:50:12.000Z");
        });

    });

});
