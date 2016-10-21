/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinitionReader*/ // Class definition reader
/*global _gpfErrorDeclare*/ // Declare new gpf.Error names
/*#endif*/

_gpfErrorDeclare("define/reader/attribute", {
    "attributeOnNonExistingMember":
        "Attribute {attributeName} must pair with a class member"
});

_GpfClassDefinitionReader.prototype._attributes = [];

_GpfClassDefinitionReader.defaultMemberProcessors.push({

    matcher: /^\[(\w+)\]$/,

    // TODO wait for all members to be processed
    exec: function (match, value, reader) {
        var attributeName = match[1],
            member = reader.getClassDefinition().getOwnMember(attributeName);
        if (!member) {
            throw gpf.Error.attributeOnNonExistingMember({
                attributeName: attributeName
            });
        }
        member.addAttributes(value);
    }

});
