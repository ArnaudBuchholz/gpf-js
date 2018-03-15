gpf.require.define({}, function () {
    "use strict";

    /*global google*/

    var promiseResolve,
        promiseReject,
        promise = new Promise(function (resolve, reject) {
            promiseResolve = resolve;
            promiseReject = reject;
        });

    gpf.web.createTagFunction("script")({
        type: "text/javascript",
        src: "https://www.gstatic.com/charts/loader.js"
    }).appendTo(document.querySelector("head") || document.body);

    setTimeout(promiseReject, 10000); // No more than 10 seconds to load

    function checkGoogleSymbol () {
        if ("undefined" !== typeof google && google.charts) {
            google.charts.load("current", {"packages": ["corechart"]});
            google.charts.setOnLoadCallback(function () {
                promiseResolve(google);
            });

        } else {
            setTimeout(checkGoogleSymbol, 250);
        }
    }
    checkGoogleSymbol();

    return promise;
});
