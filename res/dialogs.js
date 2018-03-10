gpf.require.define({}, function () {
    "use strict";

    /*eslint-disable no-alert*/

    return {

        error: function (message) {
            alert(message);
            return Promise.resolve();
        },

        confirm: function (message) {
            return Promise.resolve(confirm(message));
        }

    };

});
