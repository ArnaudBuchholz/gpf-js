gpf.require.define({
    dom: "../dom.js",
    "tile:sources": "sources.js",
    "tile:plato": "plato.js",
    "tile:coverage": "coverage.js",
    "tile:tests": "tests.js"

}, function (require) {
    "use strict";

    var dom = require.dom,
        tiles = Object.keys(require)
            .filter(function (name) {
                return 0 === name.indexOf("tile:");
            })
            .map(function (name) {
                return new require[name]();
            });

    function refresh(tile) {
        return tile.getDynamicContent()
            .then(function (content) {
                var dynamicRoot = document.getElementById(tile.getId()).querySelector(".dynamic");
                dom.clear(dynamicRoot);
                content.forEach(function (tag) {
                    tag.appendTo(dynamicRoot);
                });
            });
    }

    var tilesRoot = document.getElementById("tiles");
    tiles.forEach(function (tile) {
      tile.render().appendTo(tilesRoot);
      refresh(tile);
    });

});
