/**
 * @file File system explore enumerator helper
 * @since 0.1.9
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*#endif*/

var GPF_FS_EXPLORE_BEFORE_START = -1;

/**
 * Automate the use of getInfo on a path array to implement IFileStorage.explore
 *
 * @param {gpf.interfaces.IFileStorage} iFileStorage File storage to get info from
 * @param {String[]} listOfPaths List of paths to return
 * @return {gpf.interfaces.IEnumerator} IEnumerator interface
 * @gpf:closure
 * @since 0.1.9
 */
function _gpfFsExploreEnumerator (iFileStorage, listOfPaths) {
    var pos = GPF_FS_EXPLORE_BEFORE_START,
        info;
    return {
        reset: function () {
            pos = GPF_FS_EXPLORE_BEFORE_START;
            return Promise.resolve();
        },
        moveNext: function () {
            ++pos;
            info = undefined;
            if (pos < listOfPaths.length) {
                return iFileStorage.getInfo(listOfPaths[pos])
                    .then(function (fsInfo) {
                        info = fsInfo;
                        return info;
                    });
            }
            return Promise.resolve();
        },
        getCurrent: function () {
            return info;
        }
    };
}
