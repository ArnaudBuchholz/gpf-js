"use strict";

describe("interfaces/array", function () {

    describe("IReadOnlyArray", function () {
        it("is a known and static interface", function () {
            /*jshint unused:false*/
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                getItemsCount: function () {},
                getItem: function (idx) {}
            }, gpf.interfaces.IReadOnlyArray));
            /*jshint unused:true*/
            /*eslint-enable no-unused-vars*/
        });
    });

    describe("IArray", function () {
        it("is a known and static interface", function () {
            /* jshint unused:false */
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                getItemsCount: function () {},
                setItemsCount: function (count) {},
                getItem: function (idx) {},
                setItem: function (idx, value) {}
            }, gpf.interfaces.IArray));
            /*jshint unused:true*/
            /*eslint-enable no-unused-vars*/
        });
    });

    describe("$ClassIArray(false)", function () {

        var gpfI = gpf.interfaces,
            A = gpf.define("A", {
                "private": {

                    "[_items]": [gpf.$ClassIArray(false)],
                    _items: []

                },
                "public": {

                    constructor: function (items) {
                        this._items = items;
                    }

                }
            });

        it("exposes an array member to IReadOnlyArray interface", function () {
            assert(gpfI.isImplementedBy(A, gpfI.IReadOnlyArray));
            var a = new A([1, 2, 3]);
            assert(gpfI.isImplementedBy(a, gpfI.IReadOnlyArray));
            assert(3 === a.getItemsCount());
            assert(1 === a.getItem(0));
            assert(2 === a.getItem(1));
            assert(3 === a.getItem(2));
        });

    });

    describe("$ClassIArray(true)", function () {

        var gpfI = gpf.interfaces,
            A = gpf.define("A", {
                "private": {

                    "[_items]": [gpf.$ClassIArray(true)],
                    _items: []

                },
                "public": {

                    constructor: function (items) {
                        this._items = items;
                    }

                }
            });

        it("exposes an array member to IReadOnlyArray interface", function () {
            assert(gpfI.isImplementedBy(A, gpfI.IReadOnlyArray));
            var a = new A([1, 2, 3]);
            assert(gpfI.isImplementedBy(a, gpfI.IReadOnlyArray));
            assert(3 === a.getItemsCount());
            assert(1 === a.getItem(0));
            assert(2 === a.getItem(1));
            assert(3 === a.getItem(2));
        });

        it("exposes an array member to IArray interface", function () {
            assert(gpfI.isImplementedBy(A, gpfI.IArray));
            var a = new A([]);
            assert(gpfI.isImplementedBy(a, gpfI.IArray));
            assert(0 === a.getItemsCount());
            a.setItemsCount(2);
            assert(2 === a.getItemsCount());
            a.setItem(0, "abc");
            assert("abc" === a.getItem(0));
        });

    });

});
