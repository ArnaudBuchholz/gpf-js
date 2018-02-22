/**
 * @file Filterable stream
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
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
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.4
         */
        constructor: function (filter) {
            this._filter = filter;
        },

        //region internal handling

        /**
         * Promise used to wait for data
         * @type {Promise}
         * @since 0.2.4
         */
        _dataInPromise: undefined,

        /**
         * Resolve function of _dataInPromise
         * @type {Function}
         * @since 0.2.4
         */
        _dataInResolve: _gpfEmptyFunc,

        /**
         * Resolve function of _writeData's Promise
         * @type {Function}
         * @since 0.2.4
         */
        _dataOutResolve: _gpfEmptyFunc,

        /**
         * Reject function of _writeData's Promise
         * @type {Function}
         * @since 0.2.4
         */
        _dataOutReject: _gpfEmptyFunc,

        /**
         * Wait until data was written to this stream
         *
         * @return {Promise} Resolved when a data as been written to this stream
         * @since 0.2.4
         */
        _waitForData: function () {
            var me = this;
            if (!me._dataInPromise) {
                me._dataInPromise = new Promise(function (resolve) {
                    me._dataInResolve = resolve;
                }).then(function (data) {
                    delete me._dataInPromise;
                    delete me._dataInResolve;
                    return data;
                });
            }
            return me._dataInPromise;
        },

        /**
         * Waits for the read API to write it out
         *
         * @param {*} data Data to write
         * @return {Promise} Resolved when write operation has been done on output
         * @since 0.2.4
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
         * @since 0.2.4
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            return me._waitForData()
                .then(function (data) {
                    if (undefined !== data) {
                        return output.write(data).then(me._dataOutResolve, me._dataOutReject);
                    }
                    me._dataOutResolve();
                    return Promise.resolve(); // Nothing to write
                });
        }),

        //endregion

        //region gpf.interfaces.IWritableStream

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.4
         */
        write: _gpfStreamSecureWrite(function (data) {
            var me = this; //eslint-disable-line no-invalid-this
            if (me._filter(data)) {
                return me._writeData(data);
            }
            return Promise.resolve();
        }),

        //endregion

        //region gpf.interfaces.IFlushableStream

        /**
         * @gpf:sameas gpf.interfaces.IFlushableStream#flush
         * @since 0.2.4
         */
        flush: function () {
            if (this._dataInPromise)  {
                return this._writeData();
            }
            return Promise.resolve();
        }

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamFilter);
