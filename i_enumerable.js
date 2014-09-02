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
    gpf._defIntrf("IEnumerable", {

        /**
         * Sets the enumerator to its initial position, which is before the
         * first element in the collection
         */
        reset: function () {
        },

        /**
         * Advances the enumerator to the next element of the collection
         * @return {Boolean} true if the enumerator was successfully advanced
         * to the next element; false if the enumerator has passed the end of
         * the collection
         */
        moveNext: function () {
            return false;
        },

        /**
         * Gets the current element in the collection
         * @return {*}
         */
        current: function () {
            return null;
        }

    });

    /**
     * Builds an enumerable interface based on an array
     *
     * @param {Object[]} array Base of the enumeration
     * @return {Object} Object implementing the IEnumerable interface
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
     * @param {Object} object
     * @return {Object} Object implementing the IEnumerable interface
     * @private
     */
    function _buildEnumerableOnArray(object) {
        // Look for related member
        var
            attributes = new gpfA.Map(object).filter(gpfA.EnumerableAttribute),
            members = attributes.members();
        gpf.ASSERT(members.length === 1,
            "Only one member can be defined as enumerable");
        return _arrayEnumerator(object[members[0]]);
    }

    /**
     * Extend the class to provide an enumerable interface
     *
     * @class gpf.attributes.EnumerableAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    gpf._defAttr("$Enumerable", gpfA.ClassAttribute, {

        /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
        _alterPrototype: function (objPrototype) {
            if (!(objPrototype[this._member] instanceof Array)) {
                gpf.Error.EnumerableInvalidMember();
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