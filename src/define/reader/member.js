/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefinitionReader*/ // Class definition reader
/*global _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

_GpfClassDefinitionReader.defaultMemberProcessors.push({

    matcher: /^\w+$/,

    exec: function (match, defaultValue, reader) {
        var memberName = match[0],
            member = new _GpfClassDefMember(memberName, defaultValue);
        reader.getClassDefinition().addMember(member);
        return member;
    }

});

