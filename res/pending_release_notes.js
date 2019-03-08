(function () {
    "use strict";
    /*global gpf*/
    var
        FIRST = 0,
        NUMBER = 1,
        versionNumber = (location.search.match(/version=(\d\.\d\.\d)/) || {})[NUMBER];
    function matchVersion (versionItem) {
        return versionItem.version === versionNumber;
    }
    if (versionNumber) {
        gpf.http.get("https://raw.githubusercontent.com/ArnaudBuchholz/gpf-js/master/build/releases.json")
            .then(function (response) {
                return JSON.parse(response.responseText);
            })
            .then(function (versions) {
                return versions.filter(matchVersion)[FIRST];
            })
            .then(function (version) {
                if (version && version.notes) {
                    location.href = "/" + version.notes;
                }
            });
    }
}());
