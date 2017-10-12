/*eslint strict: [2, "function"]*/
gpf.require.define({
    data: "data.json"
}, function (require) {
    "use strict";

    return {
        type: "gpf",
        data: require.data
    };

});
