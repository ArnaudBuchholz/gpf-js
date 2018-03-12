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

        refresh: function () {
            return gpf.http.get("/src/sources.json")
                .then(function (response) {
                    return JSON.parse(response.responseText);
                })
                .then(function (sources) {
                    var loaded = sources.filter(function (source) {
                            return source.load !== false;
                        }).length;

                    tile.appendChild(div("" + loaded + "/" + sources.length, "percentage", "/res/sources"));
                })
        }

    });

});
