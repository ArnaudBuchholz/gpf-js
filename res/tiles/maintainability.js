gpf.require.define({
    Tile: "tile.js",
    dom: "../dom.js",
    googleCharts: "../google.charts.js",
    releases: "../../build/releases.json"

}, function (require) {
    "use strict";

    function toNumber (value) {
        return parseInt(value, 10);
    }

    var dom = require.dom,
        google = require.googleCharts,
        releaseData = require.releases.map(function (release) {
            var oReleaseDateParts = release.date.split("-").map(toNumber);
            return [
                new Date(oReleaseDateParts[0], oReleaseDateParts[1] - 1, oReleaseDateParts[2]),
                release.metrics.maintainability,
                release.metrics.coverage.statements.total,
                release.metrics.coverage.branches.total,
                release.metrics.coverage.functions.total
            ];
        });

    function render() {
        var data = google.visualization.arrayToDataTable([
            [
                "Release",
                "maintainability",
                "coverage (statements)",
                "coverage (branches)",
                "coverage (functions)"
            ]
        ].concat(releaseData));
        var options = {
            backgroundColor: {
                fill: "transparent"
            },
            curveType: "function",
            series: {
                0: {targetAxisIndex: 0},
                1: {targetAxisIndex: 0},
                2: {targetAxisIndex: 0},
                3: {targetAxisIndex: 0}
            },
            vAxis: {title: "%"},
            hAxis: {title: "Release date"},
            seriesType: "lines"
        };
        var chart = new google.visualization.ComboChart(document.querySelector("li#maintainability div.graph"));
        chart.draw(data, options);
    }

    return gpf.define({
        $class: "Maintainability",
        $extend: require.Tile,

        constructor: function () {
            this.$super("maintainability", "Maintainability");
        },

        getStaticContent: function () {
            return [
                dom.div({className: "graph"})
            ];
        },

        getDynamicContent: function () {
            // static part exists
            render();
            return Promise.resolve([]);
        }

    });

});
