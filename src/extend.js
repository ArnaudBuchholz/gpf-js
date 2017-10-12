/**
 * @file Object merger
 * @since 0.1.5
 */
/*#ifndef(UMD)*/
"use strict";
/*#endif*/

/**
 * Extends the destination object by copying own enumerable properties from the source object.
 * If the member already exists, it is overwritten.
 *
 * @method gpf.extend
 * @param {Object} destination Destination object
 * @param {...Object} source Source objects
 * @return {Object} Destination object
 * @since 0.1.5
 * @deprecated since version 0.1.7, use Object.assign
 */
gpf.extend = Object.assign;
