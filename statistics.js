/*jshint node: true*/
/*eslint-env node*/
/*eslint-disable no-sync*/
"use strict";

var fs = require("fs"),
    coverageData = JSON.parse(fs.readFileSync("tmp/coverage/reports/coverage.json")),
    coverageParts = {
        statements: ["s", "statementMap"],
        functions: ["f", "fnMap"],
        branches: ["b", "branchMap"]
    };

// Use gpf library (source version)
global.gpfSourcesPath = "src/";
require("./src/boot.js");

function computeCoverage (data)     {
    var result = {},
        part,
        count,
        tested,
        ignored,
        partData,
        partMap,
        itemId,
        itemData,
        itemMap;
    for (part in coverageParts) {
        if (coverageParts.hasOwnProperty(part)) {
            count = 0;
            tested = 0;
            ignored = 0;
            partData = data[coverageParts[part][0]];
            partMap = data[coverageParts[part][1]];
            for (itemId in partData) {
                if (partData.hasOwnProperty(itemId)) {
                    ++count;
                    itemData = partData[itemId];
                    itemMap = partMap[itemId];
                    if (part === "branches") {
                        ++count;
                        if (0 < itemData[0]) {
                            ++tested;
                        } else if (itemMap.locations[0].skip) {
                            ++ignored;
                        }
                        if (0 < itemData[1]) {
                            ++tested;
                        } else if (itemMap.locations[1].skip) {
                            ++ignored;
                        }
                    } else {
                        if (0 < itemData) {
                            ++tested;
                        } else if (itemMap.skip) {
                            ++ignored;
                        }
                    }
                }
            }
            result[part] = {
                count: count,
                tested: tested,
                ignored: ignored
            };
        }
    }
    return result;
}

gpf.forEach(coverageData, function (fileCoverage, fileName) {
    console.log(fileName);
    // console.log(fileCoverage);
    var coverage = computeCoverage(fileCoverage);
    console.log(coverage);
});
