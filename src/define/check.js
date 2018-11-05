/**
 * @file Check entity definition
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfCreateAbstractFunction*/ // Build a function that throws the abstractMethod exception
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfIgnore*/ // Helper to remove unused parameter warning
/*global _gpfObjectForEach*/ // Similar to [].forEach but for objects
/*#endif*/

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

function _gpfDefineEntityCheck$PropertyInAllowed$Properties (name, allowedList) {
    if (allowedList.indexOf(name) === -1) {
        gpf.Error.invalidEntity$Property();
    }
}

function _gpfDefineEntityCheckProperty (value, name) {
    _gpfIgnore(value);
    /*jshint -W040*/ /*eslint-disable no-invalid-this*/ // bound through thisArg
    if (name.charAt(0) === "$") {
        this._check$Property(name.substr(1), value);
    } else {
        this._checkProperty(name, value);
    }
    /*jshint -W040*/ /*eslint-enable no-invalid-this*/
}

Object.assign(_GpfEntityDefinition.prototype, {

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
    _allowed$Properties: "type,name,namespace".split(","),

    /**
     * Check if the $ property is allowed
     *
     * @param {String} name $ Property name (without the starting $)
     * @param {*} value $ Property value
     * @since 0.1.6
     */
    _check$Property: function (name, value) {
        _gpfIgnore(value);
        if (name !== this._type) {
            _gpfDefineEntityCheck$PropertyInAllowed$Properties(name, this._allowed$Properties);
        }
    },

    /**
     * Throw the invalid property error
     *
     * @abstract
     * @protected
     * @since 0.1.8
     */
    _throwInvalidProperty: _gpfCreateAbstractFunction(0),

    /**
     * Regular expression used to validate member name
     *
     * @type {RegExp}
     * @readonly
     * @protected
     * @since 0.1.8
     */
    _reMemberName: new RegExp(".*"),

    /**
     * Check that the member name is a valid one
     *
     * @param {String} name Member name
     * @since 0.1.8
     */
    _checkMemberName: function (name) {
        if (!this._reMemberName.exec(name)) {
            this._throwInvalidProperty();
        }
    },

    /**
     * List of reserved member names
     *
     * @type {String[]}
     * @readonly
     * @constant
     * @since 0.1.8
     */
    _reservedNames: "super,class,public,private,protected,static,mixin".split(","),

    /**
     * Check that the member name is not a reserved one
     *
     * @param {String} name Member name
     * @since 0.1.6
     */
    _checkReservedMemberName: function (name) {
        if (this._reservedNames.indexOf(name) !== -1) {
            this._throwInvalidProperty();
        }
    },

    /**
     * Check the value of the member
     *
     * @param {String} name Property name
     * @param {*} value Property value
     * @protected
     * @since 0.1.8
     */
    _checkMemberValue: _gpfFunc(["name", "value"], " "),

    /**
     * Check if the property is allowed
     * NOTE: $ properties are handled by {@link _check$Property}
     *
     * @param {String} name Property name
     * @param {*} value Property value
     * @since 0.1.6
     */
    _checkProperty: function (name, value) {
        this._checkMemberName(name);
        this._checkReservedMemberName(name);
        this._checkMemberValue(name, value);
    },

    /**
     * Check the properties contained in the definition passed to {@link gpf.define}
     * @since 0.1.6
     */
    _checkProperties: function () {
        _gpfObjectForEach(this._initialDefinition, _gpfDefineEntityCheckProperty, this);
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
     * Check if name property is not empty (throw the error otherwise)
     *
     * @throws {gpf.Error.MissingEntityName}
     * @since 0.1.6
     */
    _checkNameIsNotEmpty: function () {
        if (!this._name) {
            gpf.Error.missingEntityName();
        }
    },

    /**
     * Throw the invalid name error
     *
     * @abstract
     * @protected
     * @since 0.1.8
     */
    _throwInvalidName: _gpfCreateAbstractFunction(0),

    /**
     * Regular expression used to validate entity name
     *
     * @type {RegExp}
     * @readonly
     * @protected
     * @since 0.1.8
     */
    _reName: new RegExp(".*"),

    /**
     * Check name property (content)
     *
     * @since 0.1.6
     */
    _checkName: function () {
        if (!this._reName.exec(this._name)) {
            this._throwInvalidName();
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
        var parts = new RegExp("(.*)\\.([^\\.]+)$").exec(this._name),
            NAME_PART = 2,
            NAMESPACE_PART = 1;
        if (parts) {
            this._name = parts[NAME_PART];
            return parts[NAMESPACE_PART];
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
        if (!new RegExp("^(:?[a-z_$][a-zA-Z0-9]+(:?\\.[a-z_$][a-zA-Z0-9]+)*)?$").exec(this._namespace)) {
            gpf.Error.invalidEntityNamespace();
        }
    },

    check: function () {
        this._checkProperties();
        this._readName();
        this._checkNameIsNotEmpty();
        this._readNamespace();
        this._checkName();
        this._checkNamespace();
    }

});
