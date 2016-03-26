/*#ifndef(UMD)*/
"use strict";
/*exported _gpfGenericFactory*/ // Create any class by passing the right number of parameters
/*#endif*/

/**
 * Create any class by passing the right number of parameters
 *
 * @this {Function} constructor to invoke
 */
var _gpfGenericFactory = (function () {
    // Generate the constructor call forwarder function
    var src = [
            "var C = this,",
            "    p = arguments,",
            "    l = p.length;"
        ],
        args = [],
        idx,
        Func = Function;
    for (idx = 0; idx < 10; ++idx) {
        args.push("p[" + idx + "]");
    }
    for (idx = 0; idx < 10; ++idx) {
        src.push("    if (" + idx + " === l) {");
        src.push("        return new C(" + args.slice(0, idx).join(", ") + ");");
        src.push("    }");
    }
    return new Func(src.join("\r\n"));
}());

/*#ifndef(UMD)*/

gpf.internals._gpfGenericFactory = _gpfGenericFactory;

/*#endif*/
