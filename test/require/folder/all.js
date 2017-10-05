/*eslint strict: [2, "function"]*/
gpf.require({
    amd: "../amd.js",
    data: "../data.json",
    gpf: "../gpf.js",
    commonjs: "../common.js"

}, function (require) {
    "use strict";

    return Object.assign({
        type: "all"
    }, require);
});
