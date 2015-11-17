var fs = require("fs"),
    coverageData = JSON.parse(fs.readFileSync("tmp/coverage/reports/coverage.json"));

var parts = {
    statements: ["s", "statementMap"],
    functions: ["f", "fnMap"],
    branches: ["b", "branchMap"]
}

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
    for (part in parts) {
        if (parts.hasOwnProperty(part)) {
            count = 0;
            tested = 0;
            ignored = 0;
            partData = data[parts[part][0]];
            partMap = data[parts[part][1]];
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

for (var file in coverageData) {
    var fileCoverage = coverageData[file];
    console.log(file);
    // console.log(fileCoverage);
    var coverage = computeCoverage(fileCoverage);
    console.log(coverage);
    // process.exit(0);
}
