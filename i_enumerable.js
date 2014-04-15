/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces,
        gpfA = gpf.attributes;

    /**
     * Enumerable interface
     *
     * @class gpf.interfaces.IEnumerable
     * @extends gpf.interfaces.Interface
     */
    gpf.interface("IEnumerable", {

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

    /**
     * Builds an enumerable interface based on an array
     *
     * @param {object[]} array Base of the enumeration
     * @return {object} Object implementing the IEnumerable interface
     * @private
     */
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

    /**
     * Interface builder that connects to the EnumerableAttribute attribute
     *
     * @param {object} object
     * @return {object} Object implementing the IEnumerable interface
     * @private
     */
    function _buildEnumerableOnArray(object) {
        // Look for related member
        var
            attributes = new gpfA.Map(object).filter(gpfA.EnumerableAttribute),
            members = attributes.members();
        gpf.ASSERT(members.length === 1);
        return _arrayEnumerator(object[members[0]]);
    }

    /**
     * Extend the class to provide an enumerable interface
     *
     * @class gpf.attributes.EnumerableAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    gpf.attribute("$Enumerable", gpfA.ClassAttribute, {

        /**
         * @inheritDoc gpf.attributes.Attribute:alterPrototype
         */
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