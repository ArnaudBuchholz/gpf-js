gpf.require.define({
    releases: "../../build/releases.json",
    dom: "../dom.js"

}, function (require) {
    "use strict";

    var dom = require.dom,
        lastRelease = require.releases[require.releases.length - 1];

    var version = dom.div({
        className: "version"
    }, [
        dom.div({
            className: "title"
        }, lastRelease.label)
    ]);
    version.appendTo(document.body);

    dom.div({
        className: "coverage",
        style: "width: 640px; height: 400px;"
    }).appendTo(document.body);

    new Chartist.Line('.coverage', {
        series: [{
            name: "statements",
            data: require.releases.map(function (release) {
                return {
                    x: new Date(release.date),
                    y: release.metrics.coverage.statements.total
                };
            })
        }, {
            name: "branches",
            data: require.releases.map(function (release) {
                return {
                    x: new Date(release.date),
                    y: release.metrics.coverage.branches.total
                };
            })
        }, {
            name: "functions",
            data: require.releases.map(function (release) {
                return {
                    x: new Date(release.date),
                    y: release.metrics.coverage.functions.total
                };
            })
        }, {
            name: "maintainability",
            data: require.releases.map(function (release) {
                return {
                    x: new Date(release.date),
                    y: release.metrics.maintainability
                };
            })
        }]
    }, {
        fullWidth: true,
        chartPadding: {
            right: 40
        },
        axisX: {
            type: Chartist.FixedScaleAxis,
            divisor: 5,
            labelInterpolationFnc: function(dateValue) {
                var date = new Date(dateValue);
                return date.getFullYear() + "-" + date.getMonth();
            }
        },
        axisY: {
            onlyInteger: true
        }
    });

});
