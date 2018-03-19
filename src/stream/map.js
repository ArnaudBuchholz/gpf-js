/**
 * @file Mappable stream
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _GpfStreamAbtsractOperator*/ // gpf.stream.AbstractOperator
/*exported _GpfStreamMap*/ // gpf.stream.Map
/*#endif*/

/**
 * Mapping function
 *
 * @callback gpf.typedef.mapFunc
 *
 * @param {*} data Data to map
 * @return {*} Mapped data (might be the received parameter)
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
         */
        constructor: function (map) {
            this._map = map;
        },

        _process: function (data) {
            return this._writeData(this._map(data));
        }

    });