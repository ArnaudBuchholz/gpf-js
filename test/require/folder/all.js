/*eslint strict: [2, "function"]*/
gpf.require.define({
    amd: "../amd.js",
    commonjs: "../commonjs.js",
    data: "../data.json",
    gpf: "../gpf.js"

}, function (require) {
    "use strict";

    return Object.assign({
        type: "all"
    }, require);
});
