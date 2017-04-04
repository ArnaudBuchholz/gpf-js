/**
 * @file IEnumerator interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*#endif*/

/**
 * Offers a way to access an asynchronous enumeration
 *
 * @interface gpf.interfaces.IEnumerator
 */
_gpfDefine({
    $interface: "gpf.interfaces.IEnumerator",

    /**
     * Sets the enumerator to its initial position, which is *before* the first element in the collection.
     *
     * NOTE once reset has been called, you must call moveNext to access (or not) the first element
     *
     * @method gpf.interfaces.IEnumerator#reset
     * @return {Promise} Resolved when the enumerator is ready to be used
     */
    reset: _gpfCreateAbstractFunction(0),

    /**
     * Moves the enumerator to the next element of the enumeration.
     *
     * @method gpf.interfaces.IEnumerator#moveNext
     * @return {Promise<*>} Resolved with the next element
     */
    moveNext: _gpfCreateAbstractFunction(0),

    /**
     * Gets the current element in the collection.
     *
     * @method gpf.interfaces.IEnumerator#getCurrent
     * @return {*} Current element in the collection (undefined if none)
     */
    getCurrent: _gpfCreateAbstractFunction(0)

});
