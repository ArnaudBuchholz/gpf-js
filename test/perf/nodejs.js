"use strict";

var testFile = process.argv[2],
    testCases = require("./" + testFile + ".js"),
    testResults = [];

console.log("Please wait, evaluating test cases...");
Object.keys(testCases).forEach(function (label) {
    console.log("\t" + label);
    var dtStart = new Date(),
        count = 0,
        testCase = testCases[label];
    while (new Date() - dtStart < 1000) {
        testCase();
        ++count;
    }
    testResults.push({
        label: label,
        count: count
    });
});

console.log("Results:");
var lastCount = 0;
testResults.sort(function (a, b) {
    return b.count - a.count;

}).forEach(function (result, index) {
    var message = "\t[" + (index + 1) + "] " + result.label + ": " + result.count.toLocaleString("en-US");
    if (0 < index) {
        message += " -" + Math.floor(1000 * (lastCount - result.count) / lastCount) / 10 + "%";
    }
    console.log(message);
    lastCount = result.count;
});
