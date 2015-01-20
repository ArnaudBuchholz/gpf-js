/*#ifndef(UMD)*/
(function () { /* Begin of privacy scope */
    "use strict";
/*#endif*/

    var

        //region JSON attributes

        /**
         * JSON attribute (base class).
         *
         * @class gpf.attributes.JsonAttribute
         * @extends gpf.attributes.Attribute
         * @private
         */
        _Base = gpf._defAttr("JsonAttribute", {}),

        /**
         * JSON Ignore attribute
         * Indicates the member must not be serialized
         *
         * @class gpf.attributes.JsonIgnoreAttribute
         * @extends gpf.attributes.JsonAttribute
         * @alias gpf.$JsonIgnore
         */
        _Ignore = gpf._defAttr("$JsonIgnore", _Base, {})
        ;

    /**
     * TODO add object sub members
     * TODO add before/after load methods
     * TODO add before/after save methods
     */

    /**
     * Load the object properties from the json representation.
     *
     * @param {Object} object
     * @param {Object|string} json
     * @return {Object}
     * @chainable
     */
    gpf.json.load = function (object, json) {
        var
            prototype = object.constructor.prototype,
            attributes = new gpf.attributes.Map(object),
            member,
            jsonMember;
        /*jshint -W089*/ // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member]
                || attributes.member(member).has(_Ignore)) {
                continue; // Ignore functions & unwanted members
            }
            /*
             * We have a member that must be serialized,
             * by default members with a starting _ will be initialized from
             * the corresponding member (without _) of the json object
             */
            if (0 === member.indexOf("_")) {
                jsonMember = member.substr(1);
            } else {
                jsonMember = member;
            }
            if (jsonMember in json) {
                object[member] = json[jsonMember];
            } else {
                // Reset the value coming from the prototype
                object[member] = prototype[member];
            }
        }
        return object;
    };
    /*jshint +W089*/

    /**
     * Save the object properties into a json representation.
     *
     * @param {Object} object
     * @return {Object}
     */
    gpf.json.save = function (object) {
        var
            result = {},
            prototype = object.constructor.prototype,
            attributes = new gpf.attributes.Map(object),
            member,
            jsonMember,
            value;
        /*jshint -W089*/ // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member]
                || attributes.member(member).has(_Ignore)) {
                continue; // Ignore functions & unwanted members
            }
            /*
             * We have a member that must be serialized,
             * by default members with a starting _ will be initialized from
             * the corresponding member (without _) of the json object
             */
            if (0 === member.indexOf("_")) {
                jsonMember = member.substr(1);
            } else {
                jsonMember = member;
            }
            value = object[member];
            if (value !== prototype[member]) {
                result[jsonMember] =value;
            }
        }
        return result;
    };
    /*jshint +W089*/

/*#ifndef(UMD)*/
}()); /* End of privacy scope */
/*#endif*/