gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    config: "../../tmp/config.json"

}, function (require) {
    "use strict";

    var dom = require.dom,
        root = "https://github.com/ArnaudBuchholz/gpf-js/";

    return gpf.define({
        $class: "Github",
        $extend: require.Tile,

        constructor: function () {
            this.$super("github", "GitHub");
        },

        getStaticContent: function () {
            return [
                dom.ul([
                    dom.li({link: root + "issues?q=is%3Aopen+is%3Aissue+no%3Amilestone"}, "Backlog"),
                    dom.li({link: root + "milestones"}, "Milestones")
                ])
            ];
        },

        getDynamicContent: function () {
            return gpf.http.get("/github/")
                .then(function (response) {
                    return JSON.parse(response.responseText);
                })
                .then(function (status) {
                    var flag;
                    if (status.error) {
                        flag = dom.div({
                            className: "error",
                            link: "javascript:alert('link to doc')", //eslint-disable-line
                            title: status.error
                        });
                    } else {
                        flag = dom.div({
                            className: "connected",
                            link: status.profile.html_url,
                            title: status.profile.name
                        });
                    }
                    return [
                        flag
                    ];
                });
        }

    });

});
