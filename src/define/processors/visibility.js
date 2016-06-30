/*#ifndef(UMD)*/
"use strict";
/*global _GpfClassDefMember*/ // GPF class member definition
/*#endif*/

var _gpfVisibilityKeywords      = "public|protected|private|static".split("|"),
    _GPF_VISIBILITY_UNKNOWN     = -1,
    _GPF_VISIBILITY_PUBLIC      = 0,
    _GPF_VISIBILITY_PROTECTED   = 1,
//  _GPF_VISIBILITY_PRIVATE     = 2,
    _GPF_VISIBILITY_STATIC      = 3;

_GpfClassDefMember.extension.add("visibility", _GPF_VISIBILITY_UNKNOWN);
