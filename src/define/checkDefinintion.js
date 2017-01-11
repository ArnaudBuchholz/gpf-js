/**
 * @file Checking define dictionary
 */
/*#ifndef(UMD)*/
/*exported _gpfDefineCheckDefinition*/ // Check the dictionary passed to gpf.define
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfDefineCheckClassDefinition*/ // Check the class definition
"use strict";
/*#endif*/

_gpfErrorDeclare("define/checkDefinition", {
    /**
     * ### Summary
     *
     * Entity type is missing in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity type is not specified
     */
    missingEntityType: "Entity type not specified"

});

/**
 * Check the dictionary passed to gpf.define
 *
 * @param {Object} definition Entity definition
 * @throws {gpf.Error.MissingEntityType}
 */
function _gpfDefineCheckDefinition (definition) {
    if (!definition.$class) {
        gpf.error.missingEntityType();
    }
    _gpfDefineCheckClassDefinition(definition);
}
