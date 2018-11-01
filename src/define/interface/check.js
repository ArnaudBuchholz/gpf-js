/**
 * @file Check entity definition
 * @since 0.1.8
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
     * @since 0.1.8
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
     * @since 0.1.8
     */
    invalidInterfaceProperty: "Invalid interface property"

});

Object.assign(_GpfInterfaceDefinition.prototype, {

    /**
     * @iheritdoc
     * @since 0.1.8
     */
    _throwInvalidProperty: gpf.Error.invalidInterfaceProperty,

    /**
     * @inheritdoc
     * @since 0.1.8
     */
    _reMemberName: new RegExp("^[a-z][a-zA-Z0-9]*$"),

    /**
     * @inheritdoc
     * @since 0.1.8
     */
    _reservedNames: _GpfEntityDefinition.prototype._reservedNames.concat("constructor"),

    /**
     * @inheritdoc
     * @since 0.1.8
     */
    _checkMemberValue: function (name, value) {
        if (typeof value !== "function") {
            gpf.Error.invalidInterfaceProperty();
        }
    },

    /**
     * @inheritdoc
     * @since 0.1.8
     */
    _reName: new RegExp("^I[a-zA-Z0-9]*$"),

    /**
     * @iheritdoc
     * @since 0.1.8
     */
    _throwInvalidName: gpf.Error.invalidInterfaceName

});
