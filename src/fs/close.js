/**
 * @file File system close implementation helper
 * @since 0.2.7
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfFsCloseBuild*/ // Build close method that assess the stream type
/*#endif*/

/**
 * Build close method that assess the stream type
 *
 * @param {Function} ExpectedBaseClass Expected base class
 * @return {Function} Close implementation
 * @since 0.2.7
 */
function _gpfFsCloseBuild (ExpectedBaseClass) {
    return function (stream) {
        if (stream instanceof ExpectedBaseClass) {
            return stream.close();
        }
        return Promise.reject(new gpf.Error.IncompatibleStream());
    };
}
