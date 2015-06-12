/*#ifndef(UMD)*/
"use strict";
/*global _GPF_EVENT_DATA*/ // gpf.events.EVENT_DATA
/*global _GPF_EVENT_END_OF_DATA*/ // gpf.events.EVENT_END_OF_DATA
/*global _GPF_EVENT_ERROR*/ // gpf.events.EVENT_ERROR
/*global _GPF_FS_TYPE_DIRECTORY*/ // _GPF_FS_TYPE_DIRECTORY
/*global _GPF_FS_TYPE_FILE*/ // _GPF_FS_TYPE_FILE
/*global _GPF_FS_TYPE_NOT_FOUND*/ // _GPF_FS_TYPE_NOT_FOUND
/*global _GPF_FS_TYPE_UNKNOWN*/ // _GPF_FS_TYPE_UNKNOWN
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfEventsFire*/ // gpf.events.fire (internal, parameters must match)
/*global _gpfI*/ // gpf.interfaces
/*global _gpfSetReadOnlyProperty*/ // gpf.setReadOnlyProperty
/*#endif*/

_gpfErrorDeclare("fs", {
    "ClassMemberOverloadWithTypeChange":
        "You can't overload a member to change its type",
    "ClassInvalidVisibility":
        "Invalid visibility keyword"
});

gpf.fs = {

    /**
     * Get host file storage handler
     *
     * @returns {gpf.interfaces.IFileStorage}
     */
    host: function () {
        return null;
    },

    /**
     * Find and identify files matching the pattern, trigger a file event
     * when a file is found
     *
     * @param {gpf.interfaces.IFileStorage|undefined} fs file storage interface.
     * If undefined the host one is used.
     * @param {String} basePath
     * @param {String[]} filters Patterns (see gpf.path.match) of files to
     * detect
     * @param {gpf.events.Handler} eventsHandler
     *
     * @event gpf.events.EVENT_DATA
     * a matching file has been identified
     * @eventParam {String} path
     *
     * @event gpf.events.EVENT_END_OF_DATA
     */
    find: function (fs, basePath, filters, eventsHandler) {
        var
            pendingCount = 0,
            match = gpf.path.match,
            _fire = function (event, params) {
                if (!params) {
                    params = {};
                }
                _gpfEventsFire.apply(null, [event, params, eventsHandler]);
            },
            _done = function () {
                if (0 === --pendingCount) {
                    _fire(_GPF_EVENT_END_OF_DATA);
                }
            },
            _error = function (event) {
                _fire(event);
            },
            _explore = function (fileInfo) {
                if (_GPF_FS_TYPE_DIRECTORY === fileInfo.type) {
                    ++pendingCount;
                    var enumerator;
                    fs.explore(fileInfo.filePath, function (event) {
                        if (_GPF_EVENT_ERROR === event.type) {
                            _error(event);
                        } else {
                            enumerator = event.get("enumerator");
                            _gpfI.IEnumerator.each(enumerator, _explore, _done);
                        }
                    });

                } else if (_GPF_FS_TYPE_FILE === fileInfo.type) {
                    var filePath = fileInfo.filePath,
                        relativePath = gpf.path.relative(basePath, filePath);
                    if (match(filters, relativePath)) {
                        _gpfEventsFire.apply(null, [
                            _GPF_EVENT_DATA,
                            {
                                path: relativePath
                            },
                            eventsHandler
                        ]);
                    }
                } // other cases are ignored

            };
        if (!fs) {
            fs = gpf.fs.host();
        }
        filters = gpf.path.compileMatchPattern(filters);
        fs.getInfo(basePath, function (event) {
            if (_GPF_EVENT_ERROR === event.type) {
                _error(event);
            } else {
                _explore(event.get("info"));
            }
        });
    }

};

// Create file system constants
(function () {
    var gpfFs = gpf.fs,
        mappings = {
            TYPE_NOT_FOUND: _GPF_FS_TYPE_NOT_FOUND,
            TYPE_FILE: _GPF_FS_TYPE_FILE,
            TYPE_DIRECTORY: _GPF_FS_TYPE_DIRECTORY,
            TYPE_UNKNOWN: _GPF_FS_TYPE_UNKNOWN
        },
        key;
    for (key in mappings) {
        if (mappings.hasOwnProperty(key)) {
            _gpfSetReadOnlyProperty(gpfFs, key, mappings[key]);
        }
    }

}());