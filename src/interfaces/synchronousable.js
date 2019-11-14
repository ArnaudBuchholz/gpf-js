/**
 * @file ISynchronousable interface
 * @since 1.0.1
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefineInterface*/ // Internal interface definition helper
/*global _gpfInterfaceQuery*/ // gpf.interfaces.query
/*global _gpfSyncReadSourceJSON*/ // Reads a source json file (only in source mode)
/*exported _gpfISynchronousable*/ // gpf.interfaces.IThenable
/*exported _gpfIsSynchronousInterface*/ // Check if synchronous interface
/*#endif*/

/**
 * The Synchronousable interface helps identifying interfaces that can be used synchronously (i.e. the promise is
 * useless)
 *
 * @interface gpf.interfaces.ISynchronousable
 * @since 1.0.1
 */

/**
  * Request buffered data to be flushed. It does not need to wait for subsequent reads.
  *
  * @method gpf.interfaces.ISynchronousable#isSynchronous
  * @return {Boolean} True when interface can be used synchronously
  * @since 1.0.1
  */

/**
 * ISynchronousable interface specifier
 *
 * @type {gpf.interfaces.ISynchronousable}
 * @since 1.0.1
 */
var _gpfISynchronousable = _gpfDefineInterface("Synchronousable",
    _gpfSyncReadSourceJSON("interfaces/synchronousable.json"));

/**
 * Check if object implements gpf.interfaces.ISynchronousable and extracts information
 * @param {Object} object Object to check
 * @return {Boolean} Object implementing the interface or null
 * @since 1.0.1
 */
function _gpfIsSynchronousInterface (object) {
    var iSynchronousable = _gpfInterfaceQuery(_gpfISynchronousable, object);
    return iSynchronousable && iSynchronousable.isSynchronous() || false;
}
