/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfA*/ // gpf.attributes
/*global _gpfDefAttr*/ // gpf.define for attributes
/*global _gpfI*/ // gpf.interfaces
/*global _gpfDefIntrf*/ // gpf.define for interfaces
/*global _gpfIsArrayLike*/ // Return true if the parameter looks like an array
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*exported _gpfArrayEnumerator*/
/*#endif*/

_gpfErrorDeclare("i_enumerator", {
    EnumerableInvalidMember:
        "$Enumerator can be associated to arrays only"
});

/**
 * Enumerable interface
 *
 * @class gpf.interfaces.IEnumerator
 * @extends gpf.interfaces.Interface
 */
_gpfDefIntrf("IEnumerator", {

    /**
     * Sets the enumerator to its initial position, which is *before* the
     * first element in the collection
     */
    reset: function () {
    },

    /**
     * Advances the enumerator to the next element of the enumeration
     *
     * @param {gpf.events.Handler} eventsHandler
     * @return {Boolean}
     * <ul>
     *     <li>true if the enumerator was successfully advanced to the next
     *     element</li>
     *     <li>false if the enumerator has passed the end of the collection or
     *     it has to go through an asynchronous operation</li>
     *     <li></li>
     * <ul>
     *
     * NOTE: if no eventsHandler is specified, no asynchronous operation will
     * be triggered when false is returned.
     *
     * @event data the asynchronous operation succeeded, the current item is
     * available
     *
     * @event endOfData no more data is available
     */
    "[moveNext]": [gpf.$ClassEventHandler()],
    moveNext: function (eventsHandler) {
        _gpfIgnore(eventsHandler);
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
function _gpfArrayEnumerator(array) {
    var pos = -1;
    return {
        reset: function () {
            pos = -1;
        },
        moveNext: function (eventsHandler) {
            var result;
            ++pos;
            result = pos < array.length;
            if (!result && eventsHandler) {
                _gpfEventsFire.apply(this, [
                    _GPF_EVENT_END_OF_DATA,
                    {},
                    eventsHandler
                ]);
            }
            return result;
        },
        current: function () {
            if (0 > pos || pos >= array.length) {
                return undefined;
            }
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
function _buildEnumeratorOnObjectArray(object) {
    // Look for related member
    var
        attributes = new _gpfA.Map(object).filter(_gpfA.EnumerableAttribute),
        members = attributes.members();
    return _gpfArrayEnumerator(object[members[0]]);
}

/**
 * Extend the class to provide an enumerator interface
 *
 * @class gpf.attributes.EnumerableAttribute
 * @extends gpf.attributes.ClassAttribute
 * @alias gpf.$Enumerable
 */
_gpfDefAttr("$Enumerable", _gpfA.ClassAttribute, {

    "Class": [gpf.$UniqueAttribute()],

    /**
     * @inheritDoc gpf.attributes.Attribute:_alterPrototype
     */
    _alterPrototype: function (objPrototype) {
        if (!_gpfIsArrayLike(objPrototype[this._member])) {
            throw gpf.Error.EnumerableInvalidMember();
        }
        _gpfA.add(objPrototype.constructor, "Class", [
            new _gpfA.InterfaceImplementAttribute(_gpfI.IEnumerator,
                _buildEnumeratorOnObjectArray)
        ]);
    }

});