gpf.require.define({
    dom: "../dom.js",
    "tile:sources": "sources.js",
    "tile:plato": "plato.js",
    "tile:coverage": "coverage.js",
    "tile:tests": "tests.js",
    "tile:hosts": "hosts.js",
    "tile:doc": "doc.js",
    "tile:github": "github.js",
    "tile:maintainability": "maintainability.js"

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

    function refreshContent (tile, dynamicContent) {
        var dynamicRoot = document.getElementById(tile.getId()).querySelector(".dynamic");
        dom.clear(dynamicRoot);
        dynamicContent.forEach(function (tag) {
            tag.appendTo(dynamicRoot);
        });
    }

    function refresh (tile) {
        return tile.getDynamicContent()
            .then(refreshContent.bind(null, tile));
    }

    var tilesRoot = document.getElementById("tiles");
    tiles.forEach(function (tile) {
        tile.render().appendTo(tilesRoot);
        refresh(tile);
    });

    document.addEventListener("click", function (event) {
        var target = event.target,
            link;
        while (target && !(link = target.getAttribute && target.getAttribute("link"))) {
            target = target.parentNode;
        }
        if ("host" === link) {
            var versionSelect = document.getElementById("hostsVersion"),
                version = versionSelect.options[versionSelect.selectedIndex].value,
                envName = target.innerHTML;
            link = "grunt/exec:test" + envName.charAt(0).toUpperCase() + envName.substr(1) + version;
        }
        if (link) {
            window.open(link);
        }
    });

    window.onpopstate = function () {
        tiles.forEach(refresh);
    };

});
