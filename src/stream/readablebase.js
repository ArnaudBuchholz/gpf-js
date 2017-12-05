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
         * Readable stream Base
         *
         * @constructor gpf.stream.ReadableBase
         * @implements {gpf.interfaces.IReadableStream}
         */
        constructor: function () {
            this._writes = [];
        },

        /**
         * Output stream
         *
         * @type {gpf.interfaces.IWritableStream}
         */
        _output: null,

        /**
         * Records to write
         *
         * @type {Array}
         */
        _writes: [],

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
            if (me._writes.length) {
                return me._output.write(me._writes.shift())
                    .then(function () {
                        return me._writeToOutput();
                    });
            }
            return Promise.resolve();
        },

        _writeIfOutput: function () {
            if (this._output) {
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
        _write: function (data) {
            _gpfIgnore(data);
            if (arguments.length) {
                this._writes = this._writes.concat([].slice.call(arguments));
            }
            return this._writeIfOutput();
        },

        _flush: function () {
            var me = this;
            me._writeIfOutput()
                .then(function () {
                    me._output = null;
                    me._readResolve();
                });
        },

        //endregion

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            me._output = output;
            if (me._writes.length) {
                return me._write();
            }
            return new Promise(function (resolve, reject) {
                me._readResolve = resolve;
                me._readReject = reject;
            });
        })

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamReadableBase);
