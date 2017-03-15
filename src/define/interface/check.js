/**
 * @file Check entity definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _GpfInterfaceDefinition*/ // Interface definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

_gpfErrorDeclare("define/interface/check", {
    /**
     * ### Summary
     *
     * The interface name is invalid
     *
     * ### Description
     *
     * Only a valid JavaScript identifier (starting with an uppercase I) is allowed
     */
    invalidInterfaceName: "Invalid interface name",

    /**
     * ### Summary
     *
     * The interface definition contains an invalid property
     *
     * ### Description
     *
     * An interface can contain only methods and no constructor
     */
    invalidInterfaceProperty: "Invalid interface property"

});

Object.assign(_GpfInterfaceDefinition.prototype, /** @lends _GpfInterfaceDefinition.prototype */ {

    /**
     * @iheritdoc
     */
    _throwInvalidProperty: gpf.Error.invalidInterfaceProperty,

    /**
     * @inheritdoc
     */
    _reMemberName: new RegExp("^[a-z][a-zA-Z0-9]*$"),

    /**
     * @inheritdoc
     */
    _reservedNames: _GpfEntityDefinition.prototype._reservedNames.concat("constructor"),

    /**
     * @inheritdoc
     */
    _checkMemberValue: function (name, value) {
        if ("function" !== typeof value) {
            gpf.Error.invalidInterfaceProperty();
        }
    },

    /**
     * @inheritdoc
     */
    _reName: new RegExp("^I[a-zA-Z0-9]*$"),

    /**
     * @iheritdoc
     */
    _throwInvalidName: gpf.Error.invalidInterfaceName

});
