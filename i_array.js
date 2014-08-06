/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var
        gpfI = gpf.interfaces,
        gpfA = gpf.attributes,
        iROArray;

    //region IReadOnlyArray and IArray

    /**
     * Read only array interface
     *
     * @class gpf.interfaces.IReadOnlyArray
     * @extends gpf.interfaces.Interface
     */
    iROArray = gpf._defIntrf("IReadOnlyArray", {

        /**
         * Return the number of items in the array
         * @return {Number}
         */
        length: function () {
            return 0;
        },

        /**
         * Return the item inside the array (idx is 0-based)
         *
         * @param {Number} idx index
         * @return {*}
         */
        get: function (idx) {
            gpfI.ignoreParameter(idx);
            return undefined;
        }

    });

    /**
     * Array interface
     *
     * @class gpf.interfaces.IArray
     * @extends gpf.interfaces.IReadOnlyArray
     */
    gpf._defIntrf("IArray", iROArray, {

        /**
         * Set the item inside the array (idx is 0-based)
         * Return the value that was previously set (or undefined)
         *
         * @param {Number} idx index
         * @param {*} value
         * @return {*}
         */
        set: function (idx, value) {
            gpfI.ignoreParameter(idx);
            gpfI.ignoreParameter(value);
            return undefined;
        }

    });

    //endregion

    //region Class modifier to generate an array interface

    /**
     * Extend the class to provide an array-like interface
     *
     * @param {Boolean} [writeAllowed=false] writeAllowed Switch between read
     * only array and writable one
     *
     * @class gpf.attributes.ClassArrayInterfaceAttribute
     * @extends gpf.attributes.ClassAttribute
     * @alias gpf.$ClassIArray
     */
    gpf._defAttr("ClassArrayInterfaceAttribute", gpfA.ClassAttribute, {

        "[Class]": [gpf.$Alias("ClassIArray")],

        /**
         * @type {boolean}
         */
        _writeAllowed: false,

        constructor: function (writeAllowed) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
        },

        /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
        _alterPrototype: function (objPrototype) {
            var
                implementedInterface;
            if (this._writeAllowed) {
                implementedInterface = gpfI.IArray;
            } else {
                implementedInterface = gpfI.IReadOnlyArray;
            }
            gpfA.add(objPrototype.constructor, "Class",
                [gpf.$InterfaceImplement(implementedInterface)]);
            objPrototype.length = gpf._func("return this."
                + this._member + ".length;");
            objPrototype.get = gpf._func("return this."
                + this._member + "[arguments[0]];");
            if (this._writeAllowed) {
                objPrototype.set = gpf._func("var i=arguments[0],"
                + "v=this." + this._name + "[i];this."
                + this._member + "[i]=arguments[1];return v;");
            }
        }

    });

    // Alter gpf.attributes.Array class definition
    gpfA.add(gpfA.Array, "_array", [gpf.$ClassIArray(false)]);

    //endregion

    /**
     * Provides a common way to code functions that returns either an array
     * of results or a given item inside the array using an optional index
     * parameter (such as for IXmlConstNode:children)
     *
     * @param {[]} array Array to grab items from
     * @param {Number} [idx=undefined] idx Index of the item to get.
     *        When not specified, a copy of the array is returned (to avoid
     *        source modifications). When specified:
     *        if -1, returns the last element of the array or undefined
     *        if positive, returns the Nth element of the array or undefined
     *        otherwise, returns undefined
     * @return {*}
     */
    gpf.arrayOrItem = function (array, idx) {
        if (undefined === idx) {
            // To avoid result modifications altering source, clone
            // TODO may not work with IE < 9
            return Array.prototype.slice.call(array, 0);
        } else if (0 === array.length) {
            return undefined;
        } else if (-1 === idx) {
            return array[array.length - 1];
        } else if (idx < -1 || idx > array.length - 1) {
            return undefined;
        } else {
            return array[idx];
        }
    };

    //endregion

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/