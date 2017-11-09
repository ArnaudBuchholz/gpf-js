"use strict";

const
    fs = require("fs"),
    main = JSON.parse(fs.readFileSync("plato/report.history.json")),
    files = fs.readdirSync("plato/files"),
    releases = {
        "Thu, 19 Feb 2015": "0.1.5",
        "Sat, 03 Dec 2016": "0.1.5",
        "Sun, 05 Feb 2017": "0.1.6",
        "Thu, 02 Mar 2017": "0.1.7",
        "Mon, 27 Mar 2017": "0.1.8",
        "Sat, 29 Apr 2017": "0.1.9",
        "Wed, 07 Jun 2017": "0.2.1",
        "Wed, 01 Nov 2017": "0.2.2"
    },
    reDate = /[a-z]{3}, \d\d [a-z]{3} \d{4}/i;

main.forEach(function (item, itemIndex) {
    const
        date = reDate.exec(item.date)[0],
        release = releases[date],
        published = `../../ArnaudBuchholz.github.io/gpf/${release}/plato/files/`;
    let
        count = 0;
    console.log(`${date}: ${release}\n\t${published}`);
    files.forEach(function (file) {
        const
            publishedFile = published + file,
            finalReportOfFile = JSON.parse(fs.readFileSync(`plato/files/${file}/report.history.json`))
                .filter(history => reDate.exec(history.date)[0] !== date);
        try {
            fs.statSync(publishedFile); // Will fail if not existing
            const historyOfFile = JSON.parse(fs.readFileSync(`${publishedFile}/report.history.json`))
                .sort((a, b) => a.date.localeCompare(b.date))
                .filter(history => reDate.exec(history.date)[0] === date)[0];
            if (historyOfFile) {
                console.log(`\t${file} ${historyOfFile.date}`);
                ++count;
            }
        } catch (e) {
            // ignored
        }
    });
    console.log(`\tFile count: ${count}`);
    if (itemIndex === 1) process.exit(0);
});
