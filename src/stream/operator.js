/**
 * @file Operator abstract stream
 * @since 0.2.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*global _gpfStreamSecureWrite*/ // Generates a wrapper to secure multiple calls to stream#write
/*exported _GpfStreamAbtsractOperator*/ // gpf.stream.AbstractOperator
/*#endif*/

var
    _gpfStreamOperatorNoData = {},

    /**
     * Abstract operator stream
     * Base class to simplify writing of unbuffered data processor streams (filter, map)
     *
     * @class gpf.stream.AbstractOperator
     * @implements {gpf.interfaces.IReadableStream}
     * @implements {gpf.interfaces.IWritableStream}
     * @implements {gpf.interfaces.IFlushableStream}
     * @since 0.2.5
     */
    _GpfStreamAbtsractOperator = _gpfDefine({
        $class: "gpf.stream.AbstractOperator",

        //region internal handling

        /**
         * Promise used to wait for data
         * @type {Promise}
         * @since 0.2.5
         */
        _dataInPromise: undefined,

        /**
         * Resolve function of _dataInPromise
         * @type {Function}
         * @since 0.2.5
         */
        _dataInResolve: _gpfEmptyFunc,

        /**
         * Resolve function of _writeData's Promise
         * @type {Function}
         * @since 0.2.5
         */
        _dataOutResolve: _gpfEmptyFunc,

        /**
         * Reject function of _writeData's Promise
         * @type {Function}
         * @since 0.2.5
         */
        _dataOutReject: _gpfEmptyFunc,

        /**
         * Wait until data was written to this stream
         *
         * @return {Promise} Resolved when a data as been written to this stream
         * @since 0.2.5
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
         * @protected
         * @since 0.2.5
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
         * @since 0.2.5
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            return me._waitForData()
                .then(function (data) {
                    if (_gpfStreamOperatorNoData !== data) {
                        return output.write(data).then(me._dataOutResolve, me._dataOutReject);
                    }
                    me._dataOutResolve();
                    return Promise.resolve(); // Nothing to write
                });
        }),

        //endregion

        //region gpf.interfaces.IWritableStream

        /**
         * Process data, use {@link gpf.stream.AbstractOperator#_writeData} to transmit data to the reader
         *
         * @param {*} data Data to process
         * @return {Promise} Resolved when ready
         * @abstract
         * @since 0.2.5
         */
        _process:  _gpfCreateAbstractFunction(),

        /**
         * @gpf:sameas gpf.interfaces.IWritableStream#write
         * @since 0.2.5
         */
        write: _gpfStreamSecureWrite(function (data) {
            return this._process(data); //eslint-disable-line no-invalid-this
        }),

        //endregion

        //region gpf.interfaces.IFlushableStream

        /**
         * @gpf:sameas gpf.interfaces.IFlushableStream#flush
         * @since 0.2.5
         */
        flush: function () {
            if (this._dataInPromise) {
                return this._writeData(_gpfStreamOperatorNoData);
            }
            return Promise.resolve();
        }

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamAbtsractOperator);
