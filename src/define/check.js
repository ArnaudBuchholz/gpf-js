/**
 * @file Check entity definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _GpfEntityDefinition*/ // Entity definition
/*global _gpfExtend*/ // gpf.extend
/*#endif*/

_gpfErrorDeclare("define/check", {
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

var _gpfNamespaceValidationRegExp = /^[a-z_$][a-zA-Z0-9]+(:?\.[a-z_$][a-zA-Z0-9]+)*$/;

_gpfExtend(_GpfEntityDefinition.prototype, /** @lends _GpfEntityDefinition.prototype */ {

    /** Entity type (class...) */
    _type: "",

    /** Entity name */
    _name: "",

    _readName: function () {
        var definition = this._initialDefinition;
        this._name = definition["$" + this._type] || definition.$name;
    },

    _checkName: function () {
        if (!this._name) {
            gpf.Error.missingEntityName();
        }
    },

    /** Entity namespace */
    _namespace: "",

    _extractRelativeNamespaceFromName: function () {
        var name = this._name,
            lastDotPosition = name.lastIndexOf(".");
        if (-1 < lastDotPosition) {
            this._name = name.substr(lastDotPosition + 1);
            return name.substr(0, lastDotPosition);
        }
    },

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

    _checkNamespace: function () {
        var namespace = this._namespace;
        if (namespace) {
            _gpfNamespaceValidationRegExp.lastIndex = 0;
            if (!_gpfNamespaceValidationRegExp.exec(namespace)) {
                gpf.Error.invalidEntityNamespace();
            }
        }
    },

    check: function () {
        this._readName();
        this._checkName();
        this._readNamespace();
        this._checkNamespace();
    }

});
