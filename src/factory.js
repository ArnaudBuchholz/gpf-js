/**
 * @file Generic factory
 */
/*#ifndef(UMD)*/
"use strict";
/*exported _gpfGenericFactory*/ // Create any class by passing the right number of parameters
/*#endif*/

function _gpfGetGenericFactoryArguments (count) {
    var args = [],
        idx = count;
    while (idx--) {
        args.unshift("p[" + idx + "]");
    }
    return args;
}

function _gpfGenerateGenericFactorySource (maxParameters) {
    var src = ["var C = this, p = arguments, l = p.length;"],
        args = _gpfGetGenericFactoryArguments(maxParameters);
    args.forEach(function (value, idx) {
        src.push("if (" + idx + " === l) { return new C(" + args.slice(0, idx).join(", ") + ");}");
    });
    return src.join("\r\n");
}

function _gpfGenerateGenericFactory (maxParameters) {
    /*jshint -W054*/
    return new Function(_gpfGenerateGenericFactorySource(maxParameters)); //eslint-disable-line no-new-func
    /*jshint +W054*/
}

/**
 * Create any class by passing the right number of parameters
 *
 * @this {Function} constructor to invoke
 */
var _gpfGenericFactory = _gpfGenerateGenericFactory(10);

/*#ifndef(UMD)*/

gpf.internals._gpfGenericFactory = _gpfGenericFactory;

/*#endif*/
