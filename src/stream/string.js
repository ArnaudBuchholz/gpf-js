/**
 * @file String related streams
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfStreamSecureRead*/
/*global _gpfStreamSecureWrite*/
/*#endif*/

/**
 * Wraps a string inside a readable stream
 *
 * @class {gpf.node.ReadableStream}
 * @implements {gpf.interfaces.IReadableStream}
 */
_gpfDefine({
    $class: "gpf.stream.ReadableString",

    /**
     * @param {String} buffer String buffer
     * @constructor
     */
    constructor: function (buffer) {
        this._buffer = buffer;
    },

    //region gpf.interfaces.IReadableStream

    /** @inheritdoc gpf.interfaces.IReadableStream#read */
    read: _gpfStreamSecureRead(function (output) {
        return output.write(this._buffer); //eslint-disable-line no-invalid-this
    }),

    //endregion

    /** Buffer */
    _buffer: ""

});

/**
 * Creates a writable stream that can be converted to string
 *
 * @class {gpf.node.WritableStream}
 * @implements {gpf.interfaces.IWritableStream}
 */
_gpfDefine({
    $class: "gpf.stream.WritableString",

    /** @constructor */
    constructor: function () {
        this._buffer = [];
    },

    //region gpf.interfaces.IReadableStream

    /** @inheritdoc gpf.interfaces.IWritableStream#write */
    write: _gpfStreamSecureWrite(function (buffer) {
        this._buffer.push(buffer.toString()); //eslint-disable-line no-invalid-this
        return Promise.resolve();
    }),

    //endregion

    toString: function () {
        return this._buffer.join("");
    },

    /**
     * Buffer
     *
     * @type {String[]}
     */
    _buffer: []

});
