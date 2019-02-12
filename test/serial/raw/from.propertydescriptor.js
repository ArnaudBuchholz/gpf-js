"use strict";

describe("serial/raw/from.propertydescriptor", function () {

    describe("gpf.serial.fromRaw", function () {

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
            var initialCreated = instance._created;
            gpf.serial.fromRaw(instance, {
                id: "ID",
                name: undefined, // HasOwnProperty but value is undefined
                created: "",
                modified: "2018-09-19T12:50:12.000Z"
            }, function (value, property, member) {
                /*jshint validthis:true*/
                assert(this === instance); //eslint-disable-line no-invalid-this
                if (member === "_id") {
                    assert(property.name === "id");
                    assert(property.readOnly === true);
                    return; // ignore
                } else if (member === "_name") {
                    assert(property.name === "name");
                    assert(property.readOnly === false);
                    assert(value === undefined);
                    return "Test";
                } else if (member === "_created") {
                    assert(property.name === "created");
                    assert(property.readOnly === true);
                    return; // ignore
                } else if (member.type === gpf.serial.datetime) {
                    assert(member === "_modified");
                    return new Date(value);
                }
                // no _created
                assert(false);
            });
            assert(instance._id === "123");
            assert(instance._name === "Test");
            assert(instance._created === initialCreated);
            assert(instance._modified.getUTCFullYear() === 2018);
            assert(instance._modified.getUTCMonth() === 8);
            assert(instance._modified.getUTCDate() === 19);
            assert(instance._modified.getUTCHours() === 12);
            assert(instance._modified.getUTCMinutes() === 50);
            assert(instance._modified.getUTCSeconds() === 12);
        }

        it("converts properties' value", function () {
            _check(new A("123"));
        });

        it("converts properties' value (sub class)", function () {
            _check(new B("123"));
        });

    });

});
