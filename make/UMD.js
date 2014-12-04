/*global define, exports*/
/*jshint maxlen:false*/
(function (root, factory) {
    "use strict";

    /**
     * Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,
     * Rhino, and plain browser loading.
     *
     * 2014-12-04 ABZ Extended for PhantomJS
     */
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else if (typeof module !== "undefined" && module.exports) {
        factory(module.exports);
    } else {
        factory((root.gpf = {}));
    }
}(this, function (/*gpf:no-reduce*/gpf) {
    "use strict";

    __gpf__;
}));