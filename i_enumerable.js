/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

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

    function _arrayEnumerator(array) {
        var pos = -1;
        return {
            reset: function () {
                pos = -1;
            },
            moveNext: function () {
                ++pos;
                return pos < array.length;
            },
            current: function () {
                return array[pos];
            }
        };
    }

    function _buildEnumerableOnArray(object) {
        // Look for related member
        var
            attributes = new gpfA.Map(object).filter(gpfA.EnumerableAttribute),
            members = attributes.members();
        gpf.ASSERT(members.length === 1);
        return _arrayEnumerator(object[members[0]]);
    }

    gpfA.EnumerableAttribute = gpfA.Attribute.extend({

        "[Class]": [gpf.$Alias("Enumerable")],

        alterPrototype: function (objPrototype) {
            if (!(objPrototype[this._member] instanceof Array)) {
                throw {
                    message: "$Enumerable can be associated to arrays only"
                };
            }
            gpfA.add(objPrototype.constructor, "Class", [
                new gpfA.InterfaceImplementAttribute(gpfI.IEnumerable,
                    _buildEnumerableOnArray)
            ]);
        }

    });

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/