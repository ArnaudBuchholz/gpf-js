/*#ifndef(UMD)*/
"use strict";
/*global _gpfFunc*/ // Create a new function using the source
/*global _gpfStringEscapeFor*/ // Make the string content compatible with lang
/*global _gpfA*/ // _gpfA
/*global _gpfANoSerial*/ // gpf.attributes.ClassNonSerializedAttribute
/*#endif*/

var
    _gpfJsonStringify,
    _gpfJsonParse;

function _gpfObject2Json (object) {
    var
        isArray,
        results,
        property,
        value;
    isArray = object instanceof Array;
    results = [];
    /*jshint -W089*/
    for (property in object) {
        if ("function" === typeof object[property]) {
            continue; // ignore
        }
        value = _gpfJsonStringify(object[property]);
        if (isArray) {
            results.push(value);
        } else {
            results.push(_gpfStringEscapeFor(property, "javascript")
                + ":" + value);
        }
    }
    if (isArray) {
        return "[" + results.join(",") + "]";
    } else {
        return "{" + results.join(",") + "}";
    }
    /*jshint +W089*/
}

// Need to use typeof as this is a global object
if("undefined" === typeof JSON) {

    _gpfJsonStringify = function (object) {
        var type = typeof object;
        if ("undefined" === type || "function" === type) {
            return;
        } else if ("number" === type || "boolean" === type) {
            return object.toString();
        } else if ("string" === type) {
            return _gpfStringEscapeFor(object, "javascript");
        }
        if (null === object) {
            return "null";
        } else {
            return _gpfObject2Json(object);
        }
    };

    _gpfJsonParse = function (test) {
        return _gpfFunc("return " + test)();
    };

} else {
    _gpfJsonStringify = JSON.stringify;
    _gpfJsonParse = JSON.parse;
}

gpf.json = {

    /**
     * The JSON.stringify() method converts a JavaScript value to a JSON string
     *
     * @param {*} value the value to convert to a JSON string
     * @return {String}
     */
    stringify: _gpfJsonStringify,

    /**
     * The JSON.parse() method parses a string as JSON
     *
     * @param {*} text The string to parse as JSON
     * @return {Object}
     */
    parse: _gpfJsonParse,

    /**
     * TODO there must be a way to make it less specific to JSON
     * TODO handle object sub members
     * TODO handle before/after load methods
     * TODO handle before/after save methods
     */

    /**
     * Load the object properties from the json representation.
     *
     * @param {Object} object
     * @param {Object|string} json
     * @return {Object}
     * @chainable
     */
    load: function (object, json) {
        var
            prototype = object.constructor.prototype,
            attributes = new _gpfA.Map(object),
            member,
            jsonMember;
        /*jshint -W089*/ // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member]
                || attributes.member(member).has(_gpfANoSerial)) {
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
    },
    /*jshint +W089*/

    /**
     * Save the object properties into a json representation.
     *
     * @param {Object} object
     * @return {Object}
     */
    save: function (object) {
        var
            result = {},
            prototype = object.constructor.prototype,
            attributes = new _gpfA.Map(object),
            member,
            jsonMember,
            value;
        /*jshint -W089*/ // Actually, I want all properties
        for (member in prototype) {
            if ("function" === typeof prototype[member]
                || attributes.member(member).has(_gpfANoSerial)) {
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
                result[jsonMember] = value;
            }
        }
        return result;
    }
    /*jshint +W089*/

};


