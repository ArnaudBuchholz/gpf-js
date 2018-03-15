gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js"

}, function (require) {
    "use strict";

    var dom = require.dom;

    return gpf.define({
        $class: "Sources",
        $extend: require.Tile,

        constructor: function () {
            this.$super("sources", "Sources");
            this._setGruntCommand("make", "Make");
        },

        getDynamicContent: function () {
            return gpf.http.get("/src/sources.json")
                .then(function (response) {
                    return JSON.parse(response.responseText);
                })
                .then(function (sources) {
                    var loaded = sources.filter(function (source) {
                        return source.load !== false;
                    }).length;
                    return [
                        dom.div({
                            className: "percentage",
                            link: "/res/sources"
                        }, loaded)
                    ];
                });
        }

    });

});
