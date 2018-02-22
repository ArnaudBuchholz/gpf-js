/**
 * @file Filterable stream
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/
/*exported _GpfStreamFilter*/ // gpf.stream.Filter
/*#endif*/

var
    _GpfStreamFilter = _gpfDefine({
        $class: "gpf.stream.Filter",

        /**
         * Filter stream
         *
         * @param {Function} filter filter function
         * @constructor gpf.stream.BufferedRead
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         */
        constructor: function (filter) {
            this._filter = filter;
        },

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            me._readWriteToStream = output;
            me._readCheckIfData();
            return new Promise(function (resolve, reject) {
                me._readResolve = resolve;
                me._readReject = reject;
            });
        }),

        //endregion

        _waitForRead: function () {

        },

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         */
        write: _gpfStreamSecureWrite(function (data) {
            var me = this; //eslint-disable-line no-invalid-this
            if (me._filter(data)) {
                me._data = data;
                return me._waitForRead();
            }
            return Promise.resolve();
        })

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamFilter);
