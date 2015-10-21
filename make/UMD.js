/*global define, exports*/
/*jshint -W098*/ // ignore unused gpf
/*eslint no-unused-vars: 0*/ // ignore unused gpf
/*eslint strict: [2, "function"]*/ // To be more modular
/*global __gpf__*/
/*jshint node: true*/
/*eslint-env node*/
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
    __gpf__; //eslint-disable-line no-unused-expressions
}));
