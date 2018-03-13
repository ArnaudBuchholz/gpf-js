gpf.require.define({
    dom: "../dom.js",
    Sources: "sources.js"

}, function (require) {
    "use strict";

    var dom = require.dom,
        tiles = [
            require.Sources
        ].map(function (TileClass) {
            return new TileClass();
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
