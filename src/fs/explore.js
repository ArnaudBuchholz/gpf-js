/**
 * @file File system explore enumerator helper
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*#endif*/

/**
 * Automate the use of getInfo on a path array to implement IFileStorage.explore
 *
 * @param {gpf.interfaces.IFileStorage} iFileStorage File storage to get info from
 * @param {String[]} listOfPaths List of paths to return
 * @return {gpf.interfaces.IEnumerator} IEnumerator interface
 * @gpf:closure
 */
function _gpfFsExploreEnumerator (iFileStorage, listOfPaths) {
    var pos = -1,
        info;
    return {
        reset: function () {
            pos = -1;
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
        current: function () {
            return info;
        }
    };
}