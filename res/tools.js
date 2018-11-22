(function () {
    "use strict";
    /*global module, process*/

    var platform;
    if (typeof process !== "undefined") {
        platform = process.platform;
    }

    module.exports = {

        capitalize: function (string) {
            var FIRST_CHAR = 0,
                OTHER_CHARS = 1;
            return string.charAt(FIRST_CHAR).toUpperCase() + string.substring(OTHER_CHARS);
        },

        isWindows: (/^win/).test(platform),
        isMacOS: platform === "darwin"

    };

}());
