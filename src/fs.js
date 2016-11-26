/**
 * @file File system implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_FS_TYPE_DIRECTORY*/ // gpf.fs.TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // gpf.fs.TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // gpf.fs.TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_UNKNOWN*/ // gpf.fs.TYPE_UNKNOWN
/*global _gpfCreateConstants*/ // Automate constants creation
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfGetBootstrapMethod*/ // Create a method that contains a bootstrap (called only once)
/*global _gpfI*/ // gpf.interfaces
/*exported _gpfFsExploreEnumerator*/ // IFileStorage.explore helper
/*#endif*/

var
    _GPF_FS_TYPE_NOT_FOUND          = 0,
    _GPF_FS_TYPE_FILE               = 1,
    _GPF_FS_TYPE_DIRECTORY          = 2,
    _GPF_FS_TYPE_UNKNOWN            = 99;

_gpfErrorDeclare("fs", {
    "fileNotFound":
        "File not found"
});

/**
 * Automate the use of getInfo on a path array to implement IFileStorage.explore
 *
 * @param {gpf.interfaces.IFileStorage} iFileStorage
 * @param {String[]} listOfPaths
 * @return {gpf.interfaces.IEnumerator}
 */
function _gpfFsExploreEnumerator (iFileStorage, listOfPaths) {
    var pos = -1,
        info;
    // Secure the array by creating a copy
    listOfPaths = [].concat(listOfPaths);
    return {
        reset: function () {
            pos = -1;
        },
        moveNext: function (eventsHandler) {
            var me = this;
            ++pos;
            info = undefined;
            if (eventsHandler) {
                if (pos < listOfPaths.length) {
                    iFileStorage.getInfo(listOfPaths[pos], function (event) {
                        if (_GPF_EVENT_ERROR === event.type) {
                            // forward the event
                            _gpfEventsFire.call(me, event, {}, eventsHandler);
                            return;
                        }
                        info = event.get("info");
                        _gpfEventsFire.call(me, _GPF_EVENT_DATA, {}, eventsHandler);
                    });
                } else {
                    _gpfEventsFire.call(me, _GPF_EVENT_END_OF_DATA, {}, eventsHandler);
                }
            }
            return false;
        },
        current: function () {
            return info;
        }
    };
}

/**
 * Build a find method that is specific to a iFileStorage
 *
 * @param {gpf.interfaces.IFileStorage) iFileStorage
 * @return {Function} same signature than gpf.fs.find
 */
function _gpfFsBuildFindMethod (iFileStorage) {

    // @inheritdoc gpf.fs#find
    return function (basePath, filters, eventsHandler) {
        var pendingCount = 0,
            match = gpf.path.match,
            compiledFilters = gpf.path.compileMatchPattern(filters);

        function _fire (event, params) {
            _gpfEventsFire(event, params || {}, eventsHandler);
        }

        function _done (event) {
            if (_GPF_EVENT_ERROR === event.type) {
                _fire(event); // Forward the error
            }
            if (0 === --pendingCount) {
                _fire(_GPF_EVENT_END_OF_DATA);
            }
        }

        function _explore (fileInfo) {
            var filePath,
                relativePath,
                fileInfoType = fileInfo.type;
            if (_GPF_FS_TYPE_DIRECTORY === fileInfoType) {
                ++pendingCount;
                iFileStorage.explore(fileInfo.filePath, function (event) {
                    if (_GPF_EVENT_ERROR === event.type) {
                        _fire(event);
                    } else {
                        _gpfI.IEnumerator.each(event.get("enumerator"), _explore, _done);
                    }
                });

            } else if (_GPF_FS_TYPE_FILE === fileInfoType) {
                filePath = fileInfo.filePath;
                relativePath = gpf.path.relative(basePath, filePath);
                if (match(compiledFilters, relativePath)) {
                    _fire(_GPF_EVENT_DATA, {path: relativePath});
                }
            } // other cases are ignored
        }

        iFileStorage.getInfo(basePath, function (event) {
            if (_GPF_EVENT_ERROR === event.type) {
                _fire(event);
            } else {
                _explore(event.get("info"));
            }
        });
    };

}

gpf.fs = {

    /**
     * Get host file storage handler
     *
     * @return {gpf.interfaces.IFileStorage}
     */
    host: function () {
        return null;
    },

    /**
     * Find and identify files matching the pattern, trigger a file event when a file is found.
     * The search is recursive and dig through the file hierarchy.
     *
     * NOTE: errors might be thrown during the scanning of the folders. wait for END_OF_DATA that signals the real end.
     *
     * @param {String} basePath
     * @param {String[]} filters Patterns (see gpf.path.match) of files to detect
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_DATA
     * a matching file has been identified
     * @eventParam {String} path the path is relative to the basePath
     *
     * @event gpf.events.EVENT_END_OF_DATA
     */
    find: _gpfEmptyFunc

};

_gpfGetBootstrapMethod("gpf.fs.find", function () {
    return _gpfFsBuildFindMethod(gpf.fs.host());
});

_gpfCreateConstants(gpf.fs, {
    TYPE_NOT_FOUND: _GPF_FS_TYPE_NOT_FOUND,
    TYPE_FILE: _GPF_FS_TYPE_FILE,
    TYPE_DIRECTORY: _GPF_FS_TYPE_DIRECTORY,
    TYPE_UNKNOWN: _GPF_FS_TYPE_UNKNOWN
});

/*#ifndef(UMD)*/

gpf.internals._gpfFsExploreEnumerator = _gpfFsExploreEnumerator;
gpf.internals._gpfFsBuildFindMethod = _gpfFsBuildFindMethod;

/*#endif*/
