/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    gpf.fs = {

        TYPE_NOT_FOUND: 0,
        TYPE_FILE: 1,
        TYPE_DIRECTORY: 2,

        /**
         * Get information on the provided file path
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {Object} infos contains:
         * - type {Number} see gpf.fs.TYPE_xxx
         * - size {Number}
         * - createdDateTime
         * - modifiedDateTime
         */
        getInfo: function (path, eventsHandler) {
        },

        /**
         * Read as a binary stream
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {gpf.interface.IReadableStream} stream
         */
        readAsBinaryStream: function (path, eventsHandler) {
        },

        /**
         * Write as a binary stream (overwrite file if it exists)
         *
         * @param {*} path
         * @param {gpf.events.Handler} eventsHandler
         *
         * @event ready
         * @eventParam {gpf.interface.IWritableStream} stream
         */
        writeAsBinaryStream: function (path, eventsHandler) {
        }

        // TODO closing a file?

    };

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/