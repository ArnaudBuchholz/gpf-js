/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*global _GpfClassDefMember*/ // GPF class member definition
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

_gpfErrorDeclare("define/reader/attribute", {
    "attributeOnNonExistingMember":
        "Attribute {attributeName} must pair with a class member"
});

var attributeProcessor = {

    matcher: /^\[(\w+)\]$/,

    // TODO wait for all members to be processed
    process: function (match, value, classDefinition) {
        var attributeName = match[1],
            member = classDefinition.getOwnMember(attributeName);
        if (!member) {
            throw gpf.Error.attributeOnNonExistingMember({
                attributeName: attributeName
            });
        }
        member.addAttributes(value);
    }

};
