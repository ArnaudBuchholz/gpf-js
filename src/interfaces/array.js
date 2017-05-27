/**
 * @file IArray
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfA*/ // gpf.attributes
/*global _gpfAttributesAdd*/ // Shortcut for gpf.attributes.add
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfI*/ // gpf.interfaces
/*global _gpfIArrayGetItem*/ // gpf.interfaces.IReadOnlyArray#getItem factory
/*global _gpfIArrayGetItemsCount*/ // gpf.interfaces.IReadOnlyArray#getItemsCount factory
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*#endif*/

/**
 * Read only array interface
 *
 * @class gpf.interfaces.IReadOnlyArray
 * @extends gpf.interfaces.Interface
 */
var iROArray = _gpfDefIntrf("IReadOnlyArray", {

    // the number of items in the array
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

/**
 * Mutable array interface
 *
 * @class gpf.interfaces.IArray
 * @extends gpf.interfaces.IReadOnlyArray
 */
_gpfDefIntrf("IArray", iROArray, {

    /**
     * Changes the number of items in the array (new items may be set to undefined)
     *
     * @param {Number} count
     * @returns {Number} previous count
     */
    setItemsCount: function (count) {
        _gpfIgnore(count);
        return 0;
    },

    /**
     * Set the item inside the array (idx is 0-based).
     *
     * @param {Number} idx index
     * @param {*} value
     * @return {*} the value that was previously set (or undefined)
     */
    setItem: function (idx, value) {
        _gpfIgnore(idx, value);
        return undefined;
    }

});

/**
 * Extend the class to provide an array-like interface
 *
 * @param {Boolean} [writeAllowed=false] writeAllowed Switch between read only array and writable one
 *
 * @class gpf.attributes.ClassArrayInterfaceAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$ClassIArray
 */
_gpfDefAttr("$ClassIArray", _gpfA.ClassAttribute, {
    "[Class]": [gpf.$UniqueAttribute(), gpf.$MemberAttribute()],
    "-": {

        _writeAllowed: false

    },
    "#": {

        // @inheritdoc gpf.attributes.Attribute#_alterPrototype
        _alterPrototype: function (objPrototype) {
            var implementedInterface,
                member = this._member;
            if (this._writeAllowed) {
                implementedInterface = _gpfI.IArray;
            } else {
                implementedInterface = _gpfI.IReadOnlyArray;
            }
            _gpfAttributesAdd(objPrototype.constructor, "Class", [gpf.$InterfaceImplement(implementedInterface)]);
            objPrototype.getItemsCount = _gpfIArrayGetItemsCount(member);
            objPrototype.getItem = _gpfIArrayGetItem(member);
            if (this._writeAllowed) {
                objPrototype.setItemsCount = _gpfFunc(["count"], [
                    "var oldValue = this.", member, ".length;",
                    "this.", member, ".length = count;",
                    "return oldValue;"
                ].join(""));
                objPrototype.setItem = _gpfFunc(["idx", "value"], [
                    "var oldValue = this.", member, "[idx];",
                    "this.", member, "[idx] = value;",
                    "return oldValue;"
                ].join(""));
            }
        }

    },
    "+": {

        constructor: function (writeAllowed) {
            if (writeAllowed) {
                this._writeAllowed = true;
            }
        }

    }

});

// Alter gpf.attributes.Array class definition
_gpfAttributesAdd(_gpfA.Array, "_array", [gpf.$ClassIArray(false)]);
