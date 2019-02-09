"use strict";

describe("serial/raw/from.propertydescriptor", function () {

    describe("gpf.serial.fromRaw", function () {

        var A;

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
                    var _created = new Date();
                    Object.defineProperty(this, "_created", {
                        configurable: false,
                        get: function () {
                            return _created;
                        }
                    });
                    this._modified = modified || null;
                }
            });
        });

        it("converts properties' value", function () {
            var a = new A("123"),
                initialCreated = a._created;
            gpf.serial.fromRaw(a, {
                id: "ID",
                name: undefined, // HasOwnProperty but value is undefined
                created: "",
                modified: "2018-09-19T12:50:12.000Z"
            }, function (value, property, member) {
                /*jshint validthis:true*/
                assert(this === a); //eslint-disable-line no-invalid-this
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
            assert(a._id === "123");
            assert(a._name === "Test");
            assert(a._created === initialCreated);
            assert(a._modified.getUTCFullYear() === 2018);
            assert(a._modified.getUTCMonth() === 8);
            assert(a._modified.getUTCDate() === 19);
            assert(a._modified.getUTCHours() === 12);
            assert(a._modified.getUTCMinutes() === 50);
            assert(a._modified.getUTCSeconds() === 12);
        });

    });

});
