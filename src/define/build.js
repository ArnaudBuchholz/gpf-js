/**
 * @file Build entity
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfDefineEntitiesAdd*/ // Store the entity definition to be retreived later
/*global _gpfEmptyFunc*/ // An empty function
/*#endif*/

Object.assign(_GpfEntityDefinition.prototype, {

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
        /* istanbul ignore else */ // define.build.1
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
            _gpfContext(this._namespace.split("."), true)[this._name] = value;
        }
        this._instanceBuilder = value;
        _gpfDefineEntitiesAdd(this);
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
