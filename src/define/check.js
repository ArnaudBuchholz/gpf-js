/**
 * @file Check entity definition
 */
/*#ifndef(UMD)*/
"use strict";
/*global _GpfEntityDefinition*/ // GPF class definition
/*#endif*/

_GpfEntityDefinition.prototype = {

    _type: "",

    _name: "",

    _namespace: "",

    check: function () {
        gpf.Error.abstractMethod();
    }

};
