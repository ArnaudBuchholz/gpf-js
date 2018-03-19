/**
 * @file Filterable stream
 * @since 0.2.4
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfDefine*/ // Shortcut for gpf.define
/*global _GpfStreamAbtsractOperator*/ // gpf.stream.AbstractOperator
/*exported _GpfStreamFilter*/ // gpf.stream.Filter
/*#endif*/

var
    _GpfStreamFilter = _gpfDefine({
        $class: "gpf.stream.Filter",
        $extend: _GpfStreamAbtsractOperator,

        /**
         * Filter stream
         *
         * @param {gpf.typedef.filterFunc} filter Filter function
         * @constructor gpf.stream.Filter
         * @implements {gpf.interfaces.IReadableStream}
         * @implements {gpf.interfaces.IWritableStream}
         * @implements {gpf.interfaces.IFlushableStream}
         * @since 0.2.4
         */
        constructor: function (filter) {
            this._filter = filter;
        },

        _process: function (data) {
            if (this._filter(data)) {
                return this._writeData(data);
            }
            return Promise.resolve();
        }

    });
