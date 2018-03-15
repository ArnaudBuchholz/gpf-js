gpf.require.define({
    Tile: "tile.js",
    googleCharts: "../google.charts.js",
    releases: "../../build/releases.json"

}, function (require) {
    "use strict";

    function toNumber (value) {
        return parseInt(value, 10);
    }

    var releaseData = require.releases.map(function (release) {
        var oReleaseDateParts = release.date.split("-").map(toNumber);
        return [
            new Date(oReleaseDateParts[0], oReleaseDateParts[1] - 1, oReleaseDateParts[2]),
            release.metrics.maintainability,
            release.metrics.coverage.statements.total,
            release.metrics.coverage.branches.total,
            release.metrics.coverage.functions.total
        ];
    });
    debugger;
    require.googleCharts.then(function (google) {
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
            vAxes: {title: "%"},
            vAxis: {viewWindow: {max: 100}},
            hAxis: {title: "Release date"},
            seriesType: "lines"
        };
        var chart = new google.visualization.ComboChart(document.querySelector("lit.tile#maintainability .static"));
        chart.draw(data, options);
    });

    return gpf.define({
        $class: "Maintainability",
        $extend: require.Tile,

        constructor: function () {
            this.$super("maintainability", "Maintainability");
        }

    });

});
