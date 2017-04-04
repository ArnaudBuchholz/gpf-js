/**
 * @file IEnumerator interface
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*#endif*/

/**
 * Offers a way to access an asynchronous enumeration
 *
 * @interface gpf.interfaces.IEnumerator
 */

/**
 * Sets the enumerator to its initial position, which is *before* the first element in the collection.
 *
 * NOTE once reset has been called, you must call moveNext to access (or not) the first element
 *
 * @method gpf.interfaces.IEnumerator#reset
 * @return {Promise} Resolved when the enumerator is ready to be used
 */

/**
 * Moves the enumerator to the next element of the enumeration.
 *
 * @method gpf.interfaces.IEnumerator#moveNext
 * @return {Promise<*>} Resolved with the next element
 */

/**
 * Gets the current element in the collection.
 *
 * @method gpf.interfaces.IEnumerator#getCurrent
 * @return {*} Current element in the collection (undefined if none)
 */

_gpfDefineInterface("Enumerator", _gpfSyncReadSourceJSON("interfaces/enumerator.json"));
