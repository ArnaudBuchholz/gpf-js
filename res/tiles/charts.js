gpf.require.define({
    releases: "../../build/releases.json"

}, function (require) {
    "use strict";

    /*global Chartist*/
    /*jshint nonew: false */
    /*eslint-disable no-new, max-nested-callbacks */

    var TWO_DIGITS_NUMBER = 10;

    function showDate (value) {
        var date = new Date(value);
        return (/\d\d\d\d-\d\d/).exec(date.toISOString()).toString();
    }

    var Func = Function;

    function buildGetter (path) {
        return new Func("release", "return release." + path);
    }

    function buildSeries (definitions) {
        return Object.keys(definitions).reduce(function (series, name) {
            var getter = buildGetter(definitions[name]);
            series.push({
                name: name,
                data: require.releases.map(function (release) {
                    return {
                        x: new Date(release.date),
                        y: getter(release)
                    };
                })
            });
            return series;
        }, []);
    }

    return {

        series: function (definitions) {
            new Chartist.Line(".charts", {
                series: buildSeries(definitions)
            }, {
                fullWidth: true,
                chartPadding: {
                    right: 40
                },
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    divisor: 5,
                    labelInterpolationFnc: showDate
                },
                axisY: {
                    onlyInteger: true
                }
            });
        }

    };

});
