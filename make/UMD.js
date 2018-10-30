/*global define, exports*/
/*jshint -W098*/ // ignore unused gpf
/*jshint -W061*/ // eval can be harmful
/*eslint no-unused-vars: 0*/ // ignore unused gpf
/*eslint strict: [2, "function"]*/ // To be more modular
/*eslint no-new-func: 0*/ // the Function constructor is eval
/*eslint complexity: 0*/
/*global __gpf__*/
(function (factory) {
    "use strict";

    /**
     * Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
     * Rhino, and plain browser loading.
     *
     * 2014-12-04 ABZ Extended for PhantomJS
     * 2015-05-29 ABZ Modified to catch former value of gpf
     * 2018-02-06 ABZ Modified to get global context if missing
     */
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else if (typeof module !== "undefined" && module.exports) {
        factory(module.exports);
    } else {
        var root = Function("return this;")(),
            newGpf = {};
        factory(newGpf);
        root.gpf = newGpf;
    }
}(function (/*gpf:no-reduce*/gpf) {
    "use strict";
    /*jshint -W030*/ // Is used as a placeholder for injecting modules
    __gpf__; //eslint-disable-line no-unused-expressions
}));
