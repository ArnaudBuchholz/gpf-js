"use strict";
/*global describe, it, assert*/

describe("i_array", function () {

    describe("$ClassIArray", function () {

        var
            gpfI = gpf.interfaces,
            A = gpf.define("A", {

            private: {

                "[_items]": [gpf.$ClassIArray(false)],
                _items: []

            },

            public: {

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
            assert(3 === a.getItem().length);
        });

    });

});
