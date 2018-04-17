/**
 * @file Public version implementation
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfVersion*/ // GPF version
/*#endif*/

/**
 * Returns the current version
 *
 * @return {String} Version
 * @since 0.1.5
 */
gpf.version = function () {
    return _gpfVersion;
};
