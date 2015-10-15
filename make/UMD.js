/*global define, exports*/
/*jshint maxlen:false*/
/*jshint -W098*/ // ignore unused gpf
/*eslint no-unused-vars: 0*/ // ignore unused gpf
/*global __gpf__*/
(function (root, factory) {
    "use strict";

    /**
     * Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
     * Rhino, and plain browser loading.
     *
     * 2014-12-04 ABZ Extended for PhantomJS
     * 2015-05-29 ABZ Modified to catch former value of gpf
     */
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else if (typeof module !== "undefined" && module.exports) {
        factory(module.exports);
    } else {
        var newGpf = {};
        factory(newGpf);
        root.gpf = newGpf;
    }
}(this, function (/*gpf:no-reduce*/gpf) {
    "use strict";
    /*jshint -W030*/ // Is used as a placeholder for injecting modules
    __gpf__;
}));
