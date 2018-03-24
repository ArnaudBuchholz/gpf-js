gpf.require.define({}, function () {
    "use strict";

    /*eslint-disable no-alert*/

    return {

        info: function (message) {
            alert(message);
            return Promise.resolve();
        },

        error: function (message) {
            alert(message);
            return Promise.resolve();
        },

        confirm: function (message) {
            return Promise.resolve(confirm(message));
        },

        prompt: function (message, defaultValue) {
            return Promise.resolve(prompt(message, defaultValue));
        }

    };

});
