(function () { /* Begin of privacy scope */
    "use strict";

    var
        ArrayEnumerable = gpf.Class.extend({

            "[_items]": [gpf.$Enumerable()],
            _items: [],

            init: function (items) {
                this._items = items;
            }

        });

    gpf.declareTests({

        "array": [

            function (test) {
                var
                    instance,
                    enumerator;
                test.title("Array enumeration");
                instance = new ArrayEnumerable([1, 2, 3]);
                enumerator = gpf.interfaces.query(instance,
                    gpf.interfaces.IEnumerable);
                test.assert(null !== enumerator, "Got the enumerator");
                enumerator.reset();
                test.assert(enumerator.moveNext(),
                    "Moving to the first element");
                test.equal(enumerator.current(), 1, "Got the first element");
                test.assert(enumerator.moveNext(),
                    "Moving to the second element");
                test.equal(enumerator.current(), 2, "Got the second element");
                test.assert(enumerator.moveNext(),
                    "Moving to the third element");
                test.equal(enumerator.current(), 3, "Got the third element");
                test.assert(!enumerator.moveNext(), "No next element");
                enumerator.reset();
                test.assert(enumerator.moveNext(),
                    "Moving to the first element");
                test.equal(enumerator.current(), 1, "Got the first element");
            }

        ]

    });

}()); /* End of privacy scope */