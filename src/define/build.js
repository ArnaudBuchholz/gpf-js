/**
 * @file Build entity
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfArrayForEachFalsy*/ // _gpfArrayForEach that returns first truthy value computed by the callback
/*global _gpfContext*/ // Resolve contextual string
/*global _gpfEmptyFunc*/ // An empty function
/*exported _gpfDefineGetEntityFromBuilder*/ // Retrieves entity definition from instance instance builder
/*exported _gpfDefinedEntities*/ // Array of defined entities
/*#endif*/

/**
 * Array of defined entities
 * @type {_GpfEntityDefinition[]}
 * @since 0.2.4
 */
var _gpfDefinedEntities = [];

/**
 * Retrieve entity definition from instance builder.
 * NOTE: This is an internal solution that has the advantage of not exposing the entity definitions.
 *       For performance reasons, this may change in the future.
 *
 * @param {Function} instanceBuilder Instance builder
 * @return {_GpfEntityDefinition|undefined} Entity definition (if found)
 * @since 0.2.4
 */
function _gpfDefineGetEntityFromBuilder (instanceBuilder) {
    var result = _gpfArrayForEachFalsy(_gpfDefinedEntities, function (entityDefinition) {
        if (entityDefinition.getInstanceBuilder() === instanceBuilder) {
            return entityDefinition;
        }
    });
    if (!result) {
        // Reversed lookup because testing inheritance
        result = _gpfArrayForEachFalsy([].concat(_gpfDefinedEntities).reverse(), function (entityDefinition) {
            if (instanceBuilder.prototype instanceof entityDefinition.getInstanceBuilder()) {
                return entityDefinition;
            }
        });
    }
    return result;
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
