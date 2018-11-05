gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    config: "../../tmp/config.json",
    charts: "charts.js"

}, function (require) {
    "use strict";

    var HTTP_NOTFOUND = 404,
        dom = require.dom,
        metrics = require.config.metrics;

    return gpf.define({
        $class: "Plato",
        $extend: require.Tile,

        constructor: function () {
            this.$super("plato", "Plato report");
            this._setGruntCommand("plato", "Execute plato");
        },

        getDynamicContent: function () {
            return gpf.http.get("/tmp/plato/report.json")
                .then(function (response) {
                    if (response.status === HTTP_NOTFOUND) {
                        return [];
                    }
                    return JSON.parse(response.responseText);
                })
                .then(function (reportData) {
                    var maintainability = reportData.summary.average.maintainability,
                        statusClassName;
                    if (maintainability < metrics.maintainability) {
                        statusClassName = "ko";
                    } else {
                        statusClassName = "ok";
                    }
                    return [
                        dom.div({
                            className: "percentage " + statusClassName,
                            link: "tmp/plato/index.html"
                        }, maintainability)
                    ];
                });
        },

        drawCharts: function () {
            require.charts.series({
                maintainability: "metrics.maintainability"
            });
            return true;
        }

    });

});
