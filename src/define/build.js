/**
 * @file Build entity
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

_gpfExtend(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */ {

    /**
     * Instance builder function (a.k.a. public constructor)
     *
     * @type {Function}
     * @since 0.1.6
     */
    _instanceBuilder: null,

    /**
     * @gpf:read _instanceBuilder
     * @since 0.1.6
     */
    getInstanceBuilder: function () {
        if (!this._instanceBuilder) {
            this._setInstanceBuilder(this._build());
        }
        return this._instanceBuilder;
    },

    /**
     * @gpf:write _instanceBuilder
     * @since 0.1.6
     */
    _setInstanceBuilder: function (value) {
        if (this._namespace) {
            _gpfContext(this._namespace, true)[this._name] = value;
        }
        this._instanceBuilder = value;
    },

    /**
     * Process initial definition and generate instance builder function
     *
     * @return {Function} Instance builder function
     * @protected
     * @since 0.1.6
     */
    _build: _gpfEmptyFunc

});
