/**
 * @file NodeJS specific stream implementation
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _gpfI*/ // gpf.interfaces
/*global _GPF_HOST*/
/*global _gpfHost*/
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfStreamSecureRead*/
/*global _gpfStreamSecureWrite*/
/*#endif*/

if (_GPF_HOST.NODEJS === _gpfHost) {

    /**
     * Base class wrapping NodeJS streams
     *
     * @class {gpf.node.BaseStream}
     */
    _gpfDefine(/** @lends gpf.node.BaseStream */ {
        $class: "gpf.node.BaseStream",

        /**
         * @param {Object} stream NodeJS stream object
         * @constructor
         */
        constructor: function (stream) {
            this._stream = stream;
        },

        /**
         * Close the stream
         *
         * @return {Promise} Resolved when closed
         */
        close: _gpfCreateAbstractFunction(0),

        /**
         * @property {Object} NodeJS stream object
         */
        _stream: null

    });

    /**
     * Wraps a readable stream from NodeJS into a IReadableStream
     *
     * @class {gpf.node.ReadableStream}
     * @extends {gpf.node.BaseStream}
     * @implements {gpf.interfaces.IReadableStream}
     */
    _gpfDefine({
        $class: "gpf.node.ReadableStream",
        $extend: "gpf.node.BaseStream",

        /** @inheritdoc gpf.node.BaseStream#close */
        close: function () {
            return Promise.resolve();
        },

        //region gpf.interfaces.IReadableStream

        /** @inheritdoc gpf.interfaces.IReadableStream#read */
        read: _gpfStreamSecureRead(function (output) {
            var stream = this._stream; //eslint-disable-line no-invalid-this
            return new Promise(function (resolve, reject) {
                stream
                    .on("data", function (chunk) {
                        stream.pause();
                        output.write(chunk)
                            .then(function () {
                                stream.resume();
                            }, function (e) {
                                stream.close();
                                reject(e);
                            });
                    })
                    .on("end", resolve)
                    .on("error", reject);
            });
        })

        //endregion

    });

    /**
     * Wraps a writable stream from NodeJS into a IWritableStream
     *
     * @class {gpf.node.WritableStream}
     * @extends {gpf.node.BaseStream}
     * @implements {gpf.interfaces.IWritableStream}
     */
    _gpfDefine({

        /** @inheritdoc gpf.node.BaseStream#close */
        close: function () {
            return Promise.resolve();
        },

        //region gpf.interfaces.IReadableStream

        /** @inheritdoc gpf.interfaces.IWritableStream#write */
        read: _gpfStreamSecureWrite(function (buffer) {
            var stream = this._stream; //eslint-disable-line no-invalid-this
            return new Promise(function (resolve, reject) {
                stream.write(buffer);

                stream
                    .on("data", function (chunk) {
                        stream.pause();
                        output.write(chunk)
                            .then(function () {
                                stream.resume();
                            }, function (e) {
                                stream.close();
                                reject(e);
                            });
                    })
                    .on("end", resolve)
                    .on("error", reject);
            });

        })

        //endregion

    });

}
