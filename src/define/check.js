/**
 * @file Check entity definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfExtend*/ // gpf.extend
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*exported _gpfDefineGenerate$Keys*/ // Generate an array of names prefixed with $ from a comma separated list
/*#endif*/

/**
 * Generate an array of names prefixed with $ from a comma separated list
 *
 * @param {String} names Comma separated list of name
 * @return {String[]} Array of names prefixed with "$"
 * @since 0.1.6
 */
function _gpfDefineGenerate$Keys (names) {
    return names.split(",").map(function (name) {
        return "$" + name;
    });
}

_gpfErrorDeclare("define/check", {
    /**
     * ### Summary
     *
     * One of the $ properties is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * The list of possible $ properties is fixed and depends on the entity type.
     * This error is thrown when one $ property is not allowed.
     * @since 0.1.6
     */
    invalidEntity$Property: "Invalid entity $ property",

    /**
     * ### Summary
     *
     * Entity name is missing in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the entity name is missing
     * @since 0.1.6
     */
    missingEntityName: "Missing entity name",

    /**
     * ### Summary
     *
     * Entity namespace is invalid in the definition passed to {@link gpf.define}
     *
     * ### Description
     *
     * This error is thrown when the namespace is invalid
     * @since 0.1.6
     */
    invalidEntityNamespace: "Invalid entity namespace"

});

_gpfExtend(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */ {

    /**
     * Entity type (class...)
     *
     * @readonly
     * @since 0.1.6
     */
    _type: "",

    /**
     * List of allowed $ properties
     *
     * @type {String[]}
     * @readonly
     * @since 0.1.6
     */
    _allowed$Properties: _gpfDefineGenerate$Keys("type,name,namespace"),

    /**
     * Check if the $ property is allowed
     *
     * @param {String} name $ Property name
     * @see _GpfEntityDefinition.prototype._allowed$Properties
     * @throws {gpf.Error.InvalidEntity$Property}
     * @since 0.1.6
     */
    _check$Property: function (name) {
        if (-1 === this._allowed$Properties.indexOf(name)) {
            gpf.Error.invalidEntity$Property();
        }
    },

    /**
     * Check if the property is allowed
     * NOTE: $ properties are handled by {@link _check$Property}
     *
     * @param {String} name Property name
     * @since 0.1.6
     */
    _checkProperty: function (name) {
        _gpfIgnore(name);
    },

    /**
     * Check the properties contained in the definition passed to {@link gpf.define}
     * @since 0.1.6
     */
    _checkProperties: function () {
        _gpfObjectForEach(this._initialDefinition, function (value, name) {
            _gpfIgnore(value);
            /*eslint-disable no-invalid-this*/ // bound through thisArg
            if (name.charAt(0) === "$") {
                this._check$Property(name);
            } else {
                this._checkProperty(name);
            }
            /*eslint-enable no-invalid-this*/
        }, this);
    },

    /**
     * Entity name
     * @since 0.1.6
     */
    _name: "",

    /**
     * Compute name property
     * @since 0.1.6
     */
    _readName: function () {
        var definition = this._initialDefinition;
        this._name = definition["$" + this._type] || definition.$name;
    },

    /**
     * Check name property
     *
     * @throws {gpf.Error.MissingEntityName}
     * @since 0.1.6
     */
    _checkName: function () {
        if (!this._name) {
            gpf.Error.missingEntityName();
        }
    },

    /**
     * Entity namespace
     * @since 0.1.6
     */
    _namespace: "",

    /**
     * If the name is prefixed with a namespace, isolate it and update name property
     *
     * @return {String|undefined} Namespace contained in the name or undefined if none
     * @since 0.1.6
     */
    _extractRelativeNamespaceFromName: function () {
        var name = this._name,
            lastDotPosition = name.lastIndexOf(".");
        if (-1 < lastDotPosition) {
            this._name = name.substr(lastDotPosition + 1);
            return name.substr(0, lastDotPosition);
        }
    },

    /**
     * Compute namespace property
     * @since 0.1.6
     */
    _readNamespace: function () {
        var namespaces = [
            this._initialDefinition.$namespace,
            this._extractRelativeNamespaceFromName()
        ].filter(function (namespacePart) {
            return namespacePart;
        });
        if (namespaces.length > 0) {
            this._namespace = namespaces.join(".");
        }
    },

    /**
     * Check namespace property
     *
     * @throws {gpf.Error.InvalidEntityNamespace}
     * @since 0.1.6
     */
    _checkNamespace: function () {
        var namespace = this._namespace;
        if (namespace && !(/^[a-z_$][a-zA-Z0-9]+(:?\.[a-z_$][a-zA-Z0-9]+)*$/).exec(namespace)) {
            gpf.Error.invalidEntityNamespace();
        }
    },

    check: function () {
        this._checkProperties();
        this._readName();
        this._readNamespace();
        this._checkName();
        this._checkNamespace();
    }

});
