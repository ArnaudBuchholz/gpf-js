/**
 * @file Mappable stream
 * @since 0.2.5
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfStreamAbtsractOperator*/ // gpf.stream.AbstractOperator
/*global _gpfDefine*/ // Shortcut for gpf.define
/*exported _GpfStreamMap*/ // gpf.stream.Map
/*#endif*/

/**
 * Mapping function
 *
 * @callback gpf.typedef.mapFunc
 *
 * @param {*} data Data to map
 * @return {*} Mapped data (might be the received parameter)
 * @since 0.2.5
 */

var
    _GpfStreamMap = _gpfDefine({
        $class: "gpf.stream.Map",
        $extend: _GpfStreamAbtsractOperator,

        /**
         * Map stream
         *
         * @param {gpf.typedef.mapFunc} map map function
         * @constructor gpf.stream.Map
         * @extends gpf.stream.AbstractOperator
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.5
         */
        constructor: function (map) {
            this._map = map;
        },

        _process: function (data) {
            return this._writeData(this._map(data));
        }

    });
