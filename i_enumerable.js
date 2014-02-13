(function () { /* Begin of privacy scope */
    "use strict";

    // TODO: refactor!

    gpf.IEnumerable = gpf.Interface.extend({

        resetEnumeration: function () {
            /*
             *

             Reset the enumeration and return a boolean indicating if something
             can be enumerated.
             */
            return false;
        },

        endOfEnumeration: function () {
            /*
             *

             Tell if the enumeration is done.
             */
            return true;
        },

        enumerate: function () {
            /*
             *

             Reset the next item in the enumeration.
             */
            return null;
        }

    });

    gpf.extend(gpf, {

        wrapArrayToEnumerable: function (objArray) {

            return {

                _array: objArray,
                _idx: 0,

                resetEnumeration: function () {
                    this._idx = 0;
                    return 0 < this._array.length;
                },

                endOfEnumeration: function () {
                    return this._idx >= this._array.length;
                },

                enumerate: function () {
                    return this._array[ this._idx++ ];
                }

            };

        }

    });

})();
/* End of privacy scope */
