gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    config: "../../tmp/config.json",
    CoverageReport: "../../make/coverage.js",
    charts: "charts.js"

}, function (require) {
    "use strict";

    var dom = require.dom,
        metrics = require.config.metrics;

    return gpf.define({
        $class: "Coverage",
        $extend: require.Tile,

        constructor: function () {
            this.$super("coverage", "Code coverage");
        },

        getDynamicContent: function () {
            return gpf.http.get("/tmp/coverage/reports/coverage.json")
                .then(function (response) {
                    var HTTP_NOTFOUND = 404;
                    if (response.status === HTTP_NOTFOUND) {
                        return [];
                    }
                    return JSON.parse(response.responseText);
                })
                .then(function (coverageData) {
                    var report = new require.CoverageReport(coverageData),
                        global = report.getGlobal();

                    function coverage (type) {
                        var COMPLETE_RATIO = 100,
                            ratio = global[type].getCoverageRatio(),
                            statusClassName;
                        if (ratio < metrics.coverage[type]) {
                            statusClassName = "ko";
                        } else {
                            statusClassName = "ok";
                        }
                        if (ratio === COMPLETE_RATIO) {
                            ratio = "100.0";
                        }
                        return dom.div({
                            className: "coverage " + type + " " + statusClassName,
                            link: "tmp/coverage/reports/lcov-report/index.html"
                        }, ratio + "%");
                    }

                    return [
                        coverage("statements"),
                        coverage("functions"),
                        coverage("branches")
                    ];

                });
        },

        drawCharts: function () {
            require.charts.series({
                statements: "metrics.coverage.statements.total",
                branches: "metrics.coverage.branches.total",
                functions: "metrics.coverage.functions.total"
            });
            return true;
        }

    });

});
