/**
 * @file Detect entity type
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

_gpfErrorDeclare("define/checkDefinition", {
    /**
     * ### Summary
     *
     * Entity type is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity type is either missing or invalid
     * @since 0.1.6
     */
    invalidEntityType: "Invalid entity type"

});

/**
 * Dictionary of typed definition
 */
var _gpfDefineTypedBuilders = {};

function _gpfDefineBuildEndity (definition) {
    var entityBuilder;
    _gpfObjectForEach(definition, function (typeBuilder, type) {
        if (definition["$" + type]) {
            entityBuilder = typeBuilder;
        }
    });
    if (!entityBuilder) {
        entityBuilder = _gpfDefineTypedBuilders[definition.$type];
    }
    if (!entityBuilder) {
        gpf.Error.invalidEntityType();
    }
    return new typeBuilder(definition);
}
