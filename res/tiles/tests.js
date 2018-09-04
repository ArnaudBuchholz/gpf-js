gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    charts: "charts.js"

}, function (require) {
    "use strict";

    var dom = require.dom;

    return gpf.define({
        $class: "Tests",
        $extend: require.Tile,

        constructor: function () {
            this.$super("tests", "Tests");
        },

        getStaticContent: function () {
            var web = "test/host/web.html",
                mocha = "test/host/mocha/web.html";
            return dom.ul([
                dom.li([
                    dom.span({className: "version", link: web}, "sources"), " ",
                    dom.span({className: "mocha", link: mocha}, "mocha")
                ]),
                dom.li([
                    dom.span({className: "version", link: web + "?debug"}, "debug"), " ",
                    dom.span({className: "mocha", link: mocha + "?debug"}, "mocha")
                ]),
                dom.li([
                    dom.span({className: "version", link: web + "?release"}, "release"), " ",
                    dom.span({className: "mocha", link: mocha + "?release"}, "mocha")
                ]),
                dom.li([
                    dom.span({className: "mocha", link: "test/host/mocha/tpl.html"}, "tpl"), " ",
                    dom.span({className: "misc", link: "grunt/exec:jsdoc:" + [
                        "src/constants.js",
                        "src/interfaces/readablestream.js",
                        "src/interfaces/writablestream.js",
                        "src/interfaces/flushablestream.js",
                        "src/stream/bufferedread.js",
                        "src/stream/line.js"
                    ].join(":")}, "JSDoc")
                ])
            ]);
        },

        drawCharts: function () {
            require.charts.series({
                tests: "metrics.tests"
            });
            return true;
        }

    });

});
