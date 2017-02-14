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
/*exported _gpfClassMethodSuperify*/ // Create a method that can use this.$super
/*#endif*/

_gpfErrorDeclare("define/class/super", {
    /**
     * ### Summary
     *
     * An invalid member of $super was used
     *
     * ### Description
     *
     * $super members must point to a method exposed by the inherited prototype.
     */
    invalidClassSuperMember: "Invalid class super member"

});

/**
 * Extract all 'members' that are used on $super
 *
 * @param {Function} method Method to analyze
 * @return {String[]} Member names that are used
 * @since 0.1.7
 */
function _gpfClassMethodExtractSuperMembers (method) {
    var re = new RegExp("\\.\\$super\\.(\\w+)\\s*\\(", "g"),
        match = re.exec(method),
        result = [];
    while (match) {
        result.push(match[1]);
        match = re.exec(method);
    }
    return result;
}

Object.assign(_GpfClassDefinition.prototype, /** @lends _GpfClassDefinition.prototype */ {

    _get$Super: function (that, methodName, superMembers) {
        var superProto = this._extend.prototype;
        function $super () {
            return superProto[methodName].apply(this, arguments); //eslint-disable-line no-invalid-this
        }
        superMembers.forEach(function (memberName) {
            var superMethod = superProto[memberName];
            if ("function" !== typeof superMethod) {
                gpf.Error.invalidClassSuperMember();
            }
            $super[memberName] = superMethod.bind(that);
        });
        return $super;
    },

    /**
     * Body of superified method
     * @since 0.1.7
     */
    _superifiedBody: "this.$super=_classDef_._get$Super(this, _methodName_, _superMembers_);\n"
        + "var _result_=_method_.apply(this,arguments);\n"
        + "delete this.$super;\n"
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
