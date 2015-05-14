"use strict";
/*global describe, it, assert*/

describe("i_enumerator", function () {

    var
        ArrayEnumerable = gpf.define("ArrayEnumerable", {

            private: {

                "[_items]": [gpf.$Enumerable()],
                _items: []

            },

            public: {

                constructor: function (items) {
                    this._items = items;
                }

            }

        });

    describe("Synchronous test", function () {

        it("allows sequential access to items", function () {
            var
                instance,
                enumerator;
            instance = new ArrayEnumerable([1, 2, 3]);
            enumerator = gpf.interfaces.query(instance,
                gpf.interfaces.IEnumerator);
            assert(null !== enumerator);
            enumerator.reset();
            assert(true === enumerator.moveNext());
            assert(1 === enumerator.current());
            assert(true === enumerator.moveNext());
            assert(2 === enumerator.current());
            assert(true === enumerator.moveNext());
            assert(3 === enumerator.current());
            assert(false === enumerator.moveNext());
            enumerator.reset();
            assert(true === enumerator.moveNext());
            assert(1 === enumerator.current());
        });

    });

});