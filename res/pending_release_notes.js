(function () {
    "use strict";
    /*global xhr*/
    var
        FIRST = 0,
        NUMBER = 1,
        versionNumber = (location.search.match(/version=(\d\.\d\.\d)/) || {})[NUMBER];
    function matchVersion (versionItem) {
        return versionItem.version === versionNumber;
    }
    if (versionNumber) {
        xhr("https://raw.githubusercontent.com/ArnaudBuchholz/gpf-js/master/build/releases.json").get().asJson()
            .then(function (versions) {
                return versions.filter(matchVersion)[FIRST];
            })
            .then(function (version) {
                if (version.notes) {
                    location.href = "/" + version.notes;
                }
            });
    }
}());
