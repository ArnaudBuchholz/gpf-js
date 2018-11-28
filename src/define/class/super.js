/**
 * @file Class method superify
 * @since 0.1.6
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // Class definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*global _gpfFunctionBuild*/ // Build function from description and context
/*global _gpfFunctionDescribe*/ // Extract function description
/*global _gpfRegExpForEach*/ // Executes the callback for each match of the regular expression
/*exported _gpfClassMethodSuperify*/ // Create a method that can use this.$super
/*#endif*/

_gpfErrorDeclare("define/class/super", {
    /**
     * ### Summary
     *
     * $super used in a member that doesn't override a method
     *
     * ### Description
     *
     * $super can't be used if the method does not override an inherited one
     * @since 0.1.7
     */
    invalidClassSuper: "Invalid class super",

    /**
     * ### Summary
     *
     * An invalid member of $super was used
     *
     * ### Description
     *
     * $super members must point to a method exposed by the inherited prototype.
     * @since 0.1.7
     */
    invalidClassSuperMember: "Invalid class super member"

});

/**
 * Used when $super points to a non existent member
 *
 * @throws {gpf.Error.InvalidClassSuper}
 * @since 0.1.7
 */
function _gpfClassNoSuper () {
    gpf.Error.invalidClassSuper();
}

/**
 * Copy super method signature and invokes it.
 * NOTE: it is required to create a new function as it will receive additional members
 *
 * @param {Function} superMethod Super method to copy
 * @return {Function} New function that wraps the super method
 * @since 0.1.7
 */
function _gpfClassSuperCreateWithSameSignature (superMethod) {
    var definition = _gpfFunctionDescribe(superMethod);
    definition.body = "return _superMethod_.apply(this, arguments);";
    return _gpfFunctionBuild(definition, {
        _superMethod_: superMethod
    });
}

/**
 * Create $super function, either based on super method or triggering an error
 *
 * @param {*} superMember Member extracted from inherited prototype
 * @return {Function} $super function
 * @since 0.1.7
 */
function _gpfClassSuperCreate (superMember) {
    var superMethod;
    if (typeof superMember === "function") {
        superMethod = superMember;
    } else {
        superMethod = _gpfClassNoSuper;
    }
    return _gpfClassSuperCreateWithSameSignature(superMethod);
}

/**
 * Copy super method signature and apply weak binding.
 *
 * @param {Object} that Object instance
 * @param {Function} $super $super member
 * @param {*} superMethod superMember Member extracted from inherited prototype
 * @return {Function} $super method
 * @since 0.1.7
 */
function _gpfClassSuperCreateWeakBoundWithSameSignature (that, $super, superMethod) {
    var definition = _gpfFunctionDescribe(superMethod);
    definition.body = "return _superMethod_.apply(this === _$super_ ? _that_ : this, arguments);";
    return _gpfFunctionBuild(definition, {
        _that_: that,
        _$super_: $super,
        _superMethod_: superMethod
    });
}

/**
 * Create $super method
 * NOTE: if the super method is not a function, an exception is thrown
 *
 * @param {Object} that Object instance
 * @param {Function} $super $super member
 * @param {*} superMethod superMember Member extracted from inherited prototype
 * @return {Function} $super method
 * @throws {gpf.Error.InvalidClassSuperMember}
 * @since 0.1.7
 */
function _gpfClassSuperCreateMember (that, $super, superMethod) {
    if (typeof superMethod !== "function") {
        gpf.Error.invalidClassSuperMember();
    }
    return _gpfClassSuperCreateWeakBoundWithSameSignature(that, $super, superMethod);
}

/**
 * Regular expression detecting .$super use
 *
 * @type {RegExp}
 * @since 0.2.1
 */
var _gpfClassSuperRegExp = new RegExp("\\.\\$super\\.(\\w+)\\b", "g"),
    _GPF_CLASS_SUPER_MATCH_MEMBER = 1;

/**
 * Extract all 'members' that are used on $super
 *
 * @param {Function} method Method to analyze
 * @return {String[]} Member names that are used
 * @since 0.1.7
 */
function _gpfClassMethodExtractSuperMembers (method) {
    return _gpfRegExpForEach(_gpfClassSuperRegExp, method)
        .map(function (match) {
            return match[_GPF_CLASS_SUPER_MATCH_MEMBER];
        });
}

Object.assign(_GpfClassDefinition.prototype, {

    /**
     * Called before invoking a that contains $super method, it is responsible of allocating the $super object
     *
     * @param {Object} that Object instance
     * @param {String} methodName Name of the method that uses $super
     * @param {String[]} superMembers Expected member names on $super
     * @return {Function} $super method
     * @since 0.1.7
     */
    _get$Super: function (that, methodName, superMembers) {
        var superProto = this._extend.prototype,
            $super = _gpfClassSuperCreate(superProto[methodName]);
        superMembers.forEach(function (memberName) {
            $super[memberName] = _gpfClassSuperCreateMember(that, $super, superProto[memberName]);
        });
        return $super;
    },

    /**
     * Body of superified method
     * @since 0.1.7
     */
    _superifiedBody: "var _super_;\n"
        + "if (this.hasOwnProperty(\"$super\")) {\n"
        + "    _super_ = this.$super;\n"
        + "}\n"
        + "this.$super = _classDef_._get$Super(this, _methodName_, _superMembers_);\n"
        + "try{\n"
        + "    var _result_ = _method_.apply(this, arguments);\n"
        + "} finally {\n"
        + "    if (undefined === _super_) {\n"
        + "        delete this.$super;\n"
        + "    } else {\n"
        + "        this.$super = _super_;\n"
        + "    }\n"
        + "}\n"
        + "return _result_;",

    /**
     * Generates context for the superified method
     *
     * @param {Function} method Method to superify
     * @param {String} methodName Name of the method (used to search in object prototype)
     * @param {String[]} superMembers Detected $super members used in the method
     * @return {Object} Context of superified method
     * @since 0.1.7
     */
    _getSuperifiedContext: function (method, methodName, superMembers) {
        return {
            _method_: method,
            _methodName_: methodName,
            _superMembers_: superMembers,
            _classDef_: this
        };
    },

    /**
     * Generates the superified version of the method
     *
     * @param {Function} method Method to superify
     * @param {String} methodName Name of the method (used to search in object prototype)
     * @param {String[]} superMembers Detected $super members used in the method
     * @return {Function} Superified method
     * @since 0.1.7
     */
    _createSuperified: function (method, methodName, superMembers) {
        // Keep signature
        var description = _gpfFunctionDescribe(method);
        description.body = this._superifiedBody;
        return _gpfFunctionBuild(description, this._getSuperifiedContext(method, methodName, superMembers));
    },

    /**
     * Create a method that can use this.$super
     *
     * @param {Function} method Method to superify
     * @param {String} methodName Name of the method (used to search in object prototype)
     * @return {Function} Superified method
     * @since 0.1.7
     */
    _superify: function (method, methodName) {
        if (new RegExp("\\.\\$super\\b").exec(method)) {
            return this._createSuperified(method, methodName, _gpfClassMethodExtractSuperMembers(method));
        }
        return method;
    }

});
