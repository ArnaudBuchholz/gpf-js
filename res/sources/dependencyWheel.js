gpf.require.define({
    dom: "../dom.js",
    sources: "../../src/sources.json",
    flavor: "flavor.js",
    dependencies: "../../build/dependencies.json"

}, function (require) {
    "use strict";

    /*global d3*/

    var dom = require.dom,
        flavor = require.flavor,
        sourceIsAllowed = require.sources.reduce(function (map, source, index) {
            map[source.name] = !flavor || flavor[index];
            return map;
        }, {}),
        dependencies = require.dependencies,
        dependencyNames = Object.keys(dependencies)
            .filter(function (dependency) {
                return sourceIsAllowed[dependency];
            })
            .sort(),
        placeholder = dom.div({
            id: "dependencyWheel"
        }),
        chart = d3.chart.dependencyWheel()
            .width(800)
            .margin(200)
            .padding(0.02),
        data = {
            packageNames: dependencyNames
        };

    function getDependencyMatrixRow (listOfDependencies) {
        return dependencyNames.map(function (dependencyName) {
            return listOfDependencies.indexOf(dependencyName) !== -1;
        });
    }

    data.matrix = dependencyNames.map(function (dependencyName) {
        return getDependencyMatrixRow(dependencies[dependencyName]);
    });

    placeholder.appendTo(document.body);
    d3.select("#dependencyWheel")
        .datum(data)
        .call(chart);
});
