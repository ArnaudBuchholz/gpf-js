/**
 * @file Filterable stream
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
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

        //region internal handling

        /**
         * Promise used to wait for data
         * @type {Promise}
         */
        _dataInPromise: undefined,

        /**
         * Resolve function of _dataInPromise
         * @type {Function}
         */
        _dataInResolve: _gpfEmptyFunc,

        /**
         * Resolve function of _writeData's Promise
         * @type {Function}
         */
        _dataOutResolve: _gpfEmptyFunc,

        /**
         * Reject function of _writeData's Promise
         * @type {Function}
         */
        _dataOutReject: _gpfEmptyFunc,

        /**
         * Wait until data was written to this stream
         *
         * @return {Promise} Resolved when a data as been written to this stream
         */
        _waitForData: function () {
            var me = this;
            if (!me._dataInPromise) {
                me._dataInPromise = new Promise(function (resolve) {
                    me._dataInResolve = resolve;
                }).then(function (value) {
                    delete me._dataInPromise;
                    delete me._dataInResolve;
                    return value;
                }, function (reason) {
                    delete me._dataInPromise;
                    delete me._dataInResolve;
                    return Promise.reject(reason);
                });
            }
            return me._dataInPromise;
        },

        /**
         * Waits for the read API to write it out
         *
         * @param {*} data Data to write
         * @return {Promise} Resolved when write operation has been done on output
         */
        _writeData: function (data) {
            var me = this;
            me._waitForData();
            me._dataInResolve(data);
            return new Promise(function (resolve, reject) {
                me._dataOutResolve = resolve;
                me._dataOutReject = reject;
            }).then(function (value) {
                delete me._dataOutResolve;
                delete me._dataOutReject;
                return value;
            }, function (reason) {
                delete me._dataOutResolve;
                delete me._dataOutReject;
                return Promise.reject(reason);
            });
        },

        //endregion

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            return me._waitForData()
                .then(function (data) {
                    if (undefined !== data) {
                        return output.write(data).then(me._dataOutResolve, me._dataOutReject);
                    }
                    return Promise.resolve(); // Nothing to write
                });
        }),

        //endregion

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         */
        write: _gpfStreamSecureWrite(function (data) {
            var me = this; //eslint-disable-line no-invalid-this
            if (me._filter(data)) {
                return me._writeData(data);
            }
            return Promise.resolve();
        })

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamFilter);
