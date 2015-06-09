/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfI*/ // gpf.interfaces
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfArrayOrItem*/ // Common way to code IReadOnlyArray::getItem
/*#endif*/

//region IReadOnlyArray

/**
 * Read only array interface
 *
 * @class gpf.interfaces.IReadOnlyArray
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IReadOnlyArray", {

    /**
     * Return the number of items in the array
     * @return {Number}
     */
    getItemsCount: function () {
        return 0;
    },

    /**
     * Return the item inside the array (idx is 0-based)
     *
     * @param {Number} idx index
     * @return {*}
     */
    getItem: function (idx) {
        _gpfIgnore(idx);
        return undefined;
    }

});

///**
// * Array interface
// *
// * @class gpf.interfaces.IArray
// * @extends gpf.interfaces.IReadOnlyArray
// */
//_gpfDefIntrf("IArray", iROArray, {
//
//    /**
//     * Set the item inside the array (idx is 0-based)
//     * Return the value that was previously set (or undefined)
//     *
//     * @param {Number} idx index
//     * @param {*} value
//     * @return {*}
//     */
//    setItem: function (idx, value) {
//        _gpfIgnore(idx);
//        _gpfIgnore(value);
//        return undefined;
//    }
//
//});

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
_gpfDefAttr("$ClassIArray", _gpfA.ClassAttribute, {

    "Class": [gpf.$UniqueAttribute(), gpf.$MemberAttribute()],

    private: {

        /**
         * @type {boolean}
         * @private
         */
        _writeAllowed: false

    },

    protected: {

        /**
         * @inheritDoc gpf.attributes.Attribute:_alterPrototype
         */
        _alterPrototype: function (objPrototype) {
            var
                implementedInterface;
            if (this._writeAllowed) {
                implementedInterface = _gpfI.IArray;
            } else {
                implementedInterface = _gpfI.IReadOnlyArray;
            }
            _gpfA.add(objPrototype.constructor, "Class",
                [gpf.$InterfaceImplement(implementedInterface)]);
            objPrototype.getItemsCount = _gpfFunc("return this."
                + this._member + ".length;");
            objPrototype.getItem = _gpfFunc(["_gpfArrayOrItem"],
                "return function (idx) { return _gpfArrayOrItem(this. "
                + this._member + ", idx); }")(_gpfArrayOrItem);
            if (this._writeAllowed) {
                objPrototype.setItem = _gpfFunc("var i=arguments[0],"
                    + "v=this." + this._name + "[i];this."
                    + this._member + "[i]=arguments[1];return v;");
            }
        }

    },

    public: {

        constructor: function (writeAllowed) {
            if (writeAllowed) {
                // TODO decide how to implement IArray
                throw gpf.Error.NotImplemented();
                //this._writeAllowed = true;
            }
        }

    }

});

// Alter gpf.attributes.Array class definition
_gpfA.add(_gpfA.Array, "_array", [gpf.$ClassIArray(false)]);

//endregion