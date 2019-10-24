module.exports = function (testCases) {
    var testResults = [];

    console.log("Please wait, evaluating test cases...");

    function asyncLoop (testCase, startDate, count) {
        if (new Date() - startDate > 1000) {
            return Promise.resolve(count);
        }
        return testCase().then(function () {
            return asyncLoop (testCase, startDate, count + 1);
        });
    }

    function done (label, count) {
        testResults.push({
            label: label,
            count: count
        });
        next();
    }

    function loop (label, startDate) {
        console.log("\t" + label);
        var testCase = testCases[label],
            result = testCase(),
            count = 1;
        if (result.then) {
            result.then(function () {
                asyncLoop (testCase, startDate, count)
                    .then(function (totalCount) {
                        done(label, totalCount);
                    });
            });
        } else {
            while (new Date() - startDate < 1000) {
                testCase();
                ++count;
            }
            done(label, count);
        }
    }

    function next () {
        var keys = Object.keys(testCases),
            done = testResults.length;
        if (keys.length > done) {
            loop(keys[done], new Date());
        } else {
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
        }
    }

    next();
};
