"use strict";

describe("serial/raw/to.propertydescriptor", function () {

    describe("gpf.serial.toRaw", function () {

        var A, B;

        before(function () {
            A = gpf.define({
                $class: "A",

                "[_id]": [new gpf.attributes.Serializable({
                    required: true
                })],
                _id: "",

                "[_name]": [new gpf.attributes.Serializable()],
                _name: "",

                "[_created]": [new gpf.attributes.Serializable({
                    type: gpf.serial.datetime
                })],
                _created: null,

                "[_modified]": [new gpf.attributes.Serializable({
                    type: gpf.serial.datetime
                })],
                _modified: null,

                constructor: function (id, name, modified) {
                    Object.defineProperty(this, "_id", {
                        value: id,
                        writable: false
                    });
                    this._name = name;
                    this.__created = new Date();
                    this._modified = modified || null;
                }
            });

            Object.defineProperty(A.prototype, "_created", {
                configurable: false,
                get: function () {
                    return this.__created;
                }
            });

            B = gpf.define({
                $class: "B",
                $extend: A
            });
        });

        function _check (instance) {
            var raw = gpf.serial.toRaw(instance, function (value, property, member) {
                /*jshint validthis:true*/
                assert(this === instance); //eslint-disable-line no-invalid-this
                if (member === "_id") {
                    assert(property.name === "id");
                    assert(property.readOnly === true);
                    assert(value === "123");
                    return "ID";
                } else if (member === "_name") {
                    assert(property.name === "name");
                    assert(property.readOnly === false);
                    assert(value === "Test");
                    return "TEST";
                } else if (member === "_created") {
                    assert(property.name === "created");
                    assert(property.readOnly === true);
                    return; // ignore
                } else if (member === "_modified") {
                    return value.toISOString();
                }
                assert(false);
            });
            assert(Object.keys(raw).length === 3);
            assert(raw.id === "ID");
            assert(raw.name === "TEST");
            assert(raw.modified === "2018-09-19T12:50:12.000Z");
        }

        it("converts properties' value", function () {
            _check(new A("123", "Test", new Date(Date.UTC(2018, 8, 19, 12, 50, 12, 0))));
        });

        it("converts properties' value (sub class)", function () {
            _check(new B("123", "Test", new Date(Date.UTC(2018, 8, 19, 12, 50, 12, 0))));
        });

    });

});
