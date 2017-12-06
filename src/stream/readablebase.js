/**
 * @file Flushable stream base
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfIgnore*/
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*exported _GpfStreamReadableBase*/ // gpf.stream.ReadableBase
/*#endif*/

var
    _GpfStreamReadableBase = _gpfDefine(/** @lends gpf.stream.ReadableBase.prototype */ {
        $class: "gpf.stream.ReadableBase",

        /**
         * Readable stream Base.
         *
         * Handles the read part by offering protected output methods:
         * - {@see gpf.stream.ReadableBase.prototype._outputData}
         * - {@see gpf.stream.ReadableBase.prototype._outputFlush}
         * - {@see gpf.stream.ReadableBase.prototype._outputError}
         *
         * @constructor gpf.stream.ReadableBase
         * @implements {gpf.interfaces.IReadableStream}
         */
        constructor: function () {
            this._outputBuffer = [];
        },

        /**
         * Output stream
         *
         * @type {gpf.interfaces.IWritableStream}
         */
        _outputStream: null,

        /**
         * Data to write
         *
         * @type {Array}
         */
        _outputBuffer: [],

        /**
         * Read resolve function
         *
         * @type {Function}
         */
        _readResolve: null,

        /**
         * Read reject function
         *
         * @type {Function}
         */
        _readReject: null,

        //region Protected interface for sub classes

        _writeToOutput: function () {
            var me = this;
            if (me._outputBuffer.length) {
                return me._outputStream.write(me._outputBuffer.shift())
                    .then(function () {
                        return me._writeToOutput();
                    });
            }
            return Promise.resolve();
        },

        _writeIfOutput: function () {
            if (this._outputStream) {
                return this._writeToOutput();
            }
            return Promise.resolve();
        },

        /**
         *
         * @param {...*} data Data to write
         * @return {Promise} Resolved when written
         * @protected
         */
        _outputWrite: function (data) {
            _gpfIgnore(data);
            if (arguments.length) {
                this._outputBuffer = this._outputBuffer.concat([].slice.call(arguments));
            }
            return this._writeIfOutput();
        },

        _outputFlush: function () {
            var me = this;
            me._writeIfOutput()
                .then(function () {
                    me._outputStream = null;
                    me._readResolve();
                });
        },

        _outputError: function (reason) {
            this._readReject(reason);
        },

        //endregion

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            me._outputStream = output;
            if (me._outputBuffer.length) {
                me._outputData();
            }
            return new Promise(function (resolve, reject) {
                me._readResolve = resolve;
                me._readReject = reject;
            });
        })

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamReadableBase);
