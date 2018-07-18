(function () {
    "use strict";
    /*global module*/

    const
        isWindows = (/^win/).test(process.platform),
        isMacOS = process.platform === "darwin";

    module.exports = {

        capitalize: function (string) {
            return string.charAt(0).toUpperCase() + string.substr(1);
        },

        isWindows: isWindows,
        isMacOS: isMacOS

    };

}());
