/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*global _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

var attributeProcessor = {

    matcher: /\[(\w+)\]/,

    // TODO wait for all members to be processed
    process: function (match, classDefinition) {
        var member = classDefinition.getOwnMember(match[1]);
        // if (!member) {
        //     // ERROR can't add member
        // }
        member.addAttributes(classDefinition[match[0]]);
    }

};
