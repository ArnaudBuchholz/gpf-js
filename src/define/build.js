/**
 * @file Build entity
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfEmptyFunc*/ // An empty function
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*exported _gpfDefineGetEntityFromBuilder*/ // Retrieves entity definition from instance instance builder
/*#endif*/

/**
 * Array of defined entities.
 * @type {_GpfEntityDefinition[]}
 */
var _gpfDefinedEntities = [];

/**
 * Retrieves entity definition from instance instance builder.
 * NOTE: This is an internal solution that has the advantage of not exposing the entity definitions.
 *       For performance reasons, this may change in the future.
 *
 * @param {Function} instanceBuilder Instance builder
 * @return {_GpfEntityDefinition|undefined} Entity definition (if found)
 */
function _gpfDefineGetEntityFromBuilder (instanceBuilder) {
    return _gpfArrayForEachFalsy(_gpfDefinedEntities, function (entityDefinition) {
        if (entityDefinition.getInstanceBuilder() === instanceBuilder) {
            return entityDefinition;
        }
    });
}

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
        _gpfDefinedEntities.push(this);
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
