gpf.require.define({
    dom: "../dom.js",
    tools: "../tools.js",
    "tile:sources": "sources.js",
    "tile:plato": "plato.js",
    "tile:coverage": "coverage.js",
    "tile:tests": "tests.js",
    "tile:hosts": "hosts.js",
    "tile:doc": "doc.js",
    "tile:github": "github.js"

}, function (require) {
    "use strict";

    var dom = require.dom,
        tools = require.tools,
        tiles = Object.keys(require)
            .filter(function (name) {
                return name.startsWith("tile:");
            })
            .map(function (name) {
                return new require[name]();
            }),
        tilesById = {};

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
        tilesById[tile.getId()] = tile;
        tile.render().appendTo(tilesRoot);
        refresh(tile);
    });

    document.addEventListener("click", function (event) {
        var target = event.target,
            link;
        while (target && !(link = target.getAttribute && target.getAttribute("link"))) {
            target = target.parentNode;
        }
        if (link === "host") {
            var versionSelect = document.getElementById("hostsVersion"),
                version = versionSelect.options[versionSelect.selectedIndex].value,
                envName = target.innerHTML;
            link = "grunt/exec:test" + tools.capitalize(envName) + version;
        }
        if (link) {
            window.open(link);
        }
    });

    window.onpopstate = function () {
        tiles.forEach(refresh);
    };

    var _lastChartsId;

    function renderCharts (target) {
        var OFFSET = 4,
            MAX_WIDTH = 640,
            charts = document.querySelector(".charts"),
            targetRect = target.getBoundingClientRect(),
            left = targetRect.left,
            top = targetRect.top + targetRect.height + OFFSET,
            bodyWidth = document.body.getBoundingClientRect().width;
        if (left + MAX_WIDTH > bodyWidth) {
            left = bodyWidth - MAX_WIDTH;
        }
        charts.innerHTML = "";
        if (tilesById[target.id].drawCharts()) {
            charts.setAttribute("style", "left: " + left + "px; top: " + top + "px;");
        } else {
            charts.setAttribute("style", "display: none;");
        }
    }

    function mouseOver (target) {
        if (target) {
            if (target.id === _lastChartsId) {
                return;
            }
            _lastChartsId = target.id;
            renderCharts(target);
        } else {
            _lastChartsId = undefined;
            document.querySelector(".charts").setAttribute("style", "display: none;");
        }
    }

    if (typeof Chartist !== "undefined") {

        document.addEventListener("mouseover", function (event) {
            var target = event.target;
            while (target && !(target.id && target.tagName.toLowerCase() === "li" && !target.getAttribute("link"))) {
                target = target.parentNode;
            }
            mouseOver(target);
        });

        dom.div({
            className: "charts",
            style: "display: none"
        }).appendTo(document.body);
    }

});
