/**
 * @file Flushable stream base
 * @since 0.2.3
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfArraySlice*/ // [].slice.call
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfStreamSecureInstallProgressFlag*/ // Install the progress flag used by _gpfStreamSecureRead and Write
/*global _gpfStreamSecureRead*/ // Generate a wrapper to secure multiple calls to stream#read
/*exported _GpfStreamBufferedRead*/ // gpf.stream.BufferedRead
/*#endif*/

// NOTE: to avoid naming collisions with subclasses, all private members are prefixed with _read

/**
 * Token being used to control data flow
 *
 * @constructor
 * @since 0.2.3
 */
function _GpfStreamBufferedReadToken () {
}

_GpfStreamBufferedReadToken.prototype = {

    /**
     * Execute the action associated to the token
     *
     * @method _GpfStreamBufferedReadToken#execute
     * @param {gpf.stream.BufferedRead} bufferedRead Instance of gpf.stream.BufferedRead
     * @since 0.2.3
     */
    execute: _gpfEmptyFunc

};

var
    /**
     * Unique token to signal an error: it ensures the error is triggered at the right time
     *
     * @type {_GpfStreamBufferedReadToken}
     * @since 0.2.3
     */
    _gpfStreamBufferedReadError = new _GpfStreamBufferedReadToken(),

    /**
     * Unique token to signal end of read: it ensures the error is triggered at the right time
     *
     * @type {_GpfStreamBufferedReadToken}
     * @since 0.2.3
     */
    _gpfStreamBufferedReadEnd = new _GpfStreamBufferedReadToken();

_gpfStreamBufferedReadError.execute = function (bufferedRead) {
    bufferedRead._readReject(bufferedRead._readBuffer.shift());
};

_gpfStreamBufferedReadEnd.execute = function (bufferedRead) {
    bufferedRead._readResolve();
};

var
    _GpfStreamBufferedRead = _gpfDefine({
        $class: "gpf.stream.BufferedRead",

        /**
         * Implements IReadableStream by offering methods manipulating a buffer:
         * - {@link gpf.stream.BufferedRead#_appendToReadBuffer}
         * - {@link gpf.stream.BufferedRead#_completeReadBuffer}
         * - {@link gpf.stream.BufferedRead#_setReadError}
         *
         * @constructor gpf.stream.BufferedRead
         * @implements {gpf.interfaces.IReadableStream}
         * @since 0.2.3
         */
        constructor: function () {
            this._readBuffer = [];
        },

        /**
         * Read buffer, also contains tokens to signal the end of the read ({@see _GpfStreamBufferedReadToken} and
         * {@see _gpfStreamBufferedReadEnd})
         * @since 0.2.3
         */
        _readBuffer: [],

        /**
         * Stream to write to
         *
         * @type {gpf.interfaces.IWritableStream}
         * @since 0.2.3
         */
        _readWriteToStream: null,

        /**
         * Read Promise resolve function
         *
         * @type {Function}
         * @since 0.2.3
         */
        _readResolve: null,

        /**
         * Read Promise reject function
         *
         * @type {Function}
         * @since 0.2.3
         */
        _readReject: null,

        //region Secured writing

        _readDataIsToken: function (data) {
            if (data instanceof _GpfStreamBufferedReadToken) {
                data.execute(this);
                return true;
            }
            return false;
        },

        _readWriteToOutput: function () {
            var me = this,
                data = me._readBuffer.shift();
            if (me._readDataIsToken(data)) {
                return Promise.resolve();
            }
            return me._readWriteToStream.write(data)
                .then(function () {
                    if (me._readBuffer.length) {
                        return me._readWriteToOutput();
                    }
                    me._readNotWriting = true;
                });
        },

        /**
         * Critical section to avoid writing while writing
         * @since 0.2.3
         */
        _readNotWriting: true,

        /**
         * Triggers write only if no write is in progress
         * @since 0.2.3
         */
        _readSafeWrite: function () {
            var me = this;
            if (me._readNotWriting) {
                me._readNotWriting = false;
                me._readWriteToOutput()
                    .then(undefined, function (reason) {
                        me._readReject(reason);
                    });
            }
        },

        /**
         * Check if data exists and trigger write consequently
         * @since 0.2.3
         */
        _readCheckIfData: function () {
            if (this._readBuffer.length) {
                this._readSafeWrite();
            }
        },

        /**
         * Check if a read is in progress and trigger write consequently
         * @since 0.2.3
         */
        _readCheckIfOutput: function () {
            if (this._readWriteToStream) {
                this._readCheckIfData();
            }
        },

        //endregion

        //region Protected interface for sub classes

        /**
         * Adds data to the read buffer
         *
         * @param {...*} data Data to write
         * @gpf:chainable
         * @protected
         * @since 0.2.3
         */
        _appendToReadBuffer: function (data) {
            _gpfIgnore(data);
            this._readBuffer = this._readBuffer.concat(_gpfArraySlice(arguments));
            this._readCheckIfOutput();
            return this;
        },

        /**
         * Ends the read without any error
         *
         * @protected
         * @since 0.2.3
         */
        _completeReadBuffer: function () {
            this._readBuffer.push(_gpfStreamBufferedReadEnd);
            this._readCheckIfOutput();
        },

        /**
         * Ends the read with an error
         *
         * @param {*} reason Rejection reason
         * @protected
         * @since 0.2.3
         */
        _setReadError: function (reason) {
            this._readBuffer.push(_gpfStreamBufferedReadError, reason);
            this._readCheckIfOutput();
        },

        //endregion

        //region gpf.interfaces.IReadableStream

        /**
         * @gpf:sameas gpf.interfaces.IReadableStream#read
         * @since 0.2.3
         */
        read: _gpfStreamSecureRead(function (output) {
            var me = this; //eslint-disable-line no-invalid-this
            me._readWriteToStream = output;
            me._readCheckIfData();
            return new Promise(function (resolve, reject) {
                me._readResolve = resolve;
                me._readReject = reject;
            });
        })

        //endregion

    });

_gpfStreamSecureInstallProgressFlag(_GpfStreamBufferedRead);
