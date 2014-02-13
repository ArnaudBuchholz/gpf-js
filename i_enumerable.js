(function () { /* Begin of privacy scope */
    "use strict";

    var
        gpfI = gpf.interfaces,
        gpfA = gpf.attributes;

    gpfI.IEnumerable = gpfI.Interface.extend({

        /**
         * Sets the enumerator to its initial position, which is before the
         * first element in the collection
         */
        reset: function () {
        },

        /**
         * Advances the enumerator to the next element of the collection
         * @returns {boolean} true if the enumerator was successfully advanced
         * to the next element; false if the enumerator has passed the end of
         * the collection
         */
        moveNext: function () {
            return false;
        },

        /**
         * Gets the current element in the collection
         * @returns {*}
         */
        current: function () {
            return null;
        }

    });

    function _buildEnumerableOnArray(object) {

    }

    gpfA.EnumerableAttribute = gpfA.Attribute.extend({

        "[Class]": [gpf.$Alias("Enumerable")],

        alterPrototype: function (objPrototype) {
            if (!(objPrototype[this._member] instanceof Array)) {
                throw '$Enumerable can be associated to arrays only';
            }
            gpf.attributes.add(objPrototype, "Class", [
                new gpfA.InterfaceImplementAttribute(gpfI.IEnumerable,
                    _buildEnumerableOnArray)]);
        }

    });

/*
    TODO find a way to associate object's array members to an IEnumerable

    function _createArrayEnumerator

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

 */

})();
/* End of privacy scope */
