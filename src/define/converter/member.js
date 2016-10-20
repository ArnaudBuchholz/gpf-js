/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinition*/ // GPF class definition
/*global _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

var memberProcessor = {

    matcher: /^\w+$/,

    process: function (match, defaultValue, classDefinition) {
        var memberName = match[0],
            member = new _GpfClassDefMember(memberName, defaultValue);
        classDefinition.addMember(member);
    }

};
