/*eslint-disable*/
/*jshint ignore:start*/

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

/**
 * Find and identify files matching the pattern, trigger a file event when a file is found.
 * The search is recursive and dig through the file hierarchy.
 *
 * NOTE: errors might be thrown during the scanning of the folders. wait for END_OF_DATA that signals the real end.
 *
 * @method gpf.fs#find
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
_gpfGetBootstrapMethod("gpf.fs.find", function () {
    return _gpfFsBuildFindMethod(gpf.fs.host());
});
