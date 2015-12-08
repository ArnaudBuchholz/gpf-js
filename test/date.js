(function () {/* Begin of privacy scope */
    "use strict";

    /*jshint -W027*/ // Done on purpose until gpf.declareTests is removed
    return;

    var
        _refDate = new Date(1975, 3, 26, 12, 14, 26),
        _refDateL = "1975-04-26 12:14:26",
        _refDateS = "1975-04-26";


    gpf.declareTests({

        "dateToComparableFormat": [

            function (test) {
                test.equal(gpf.dateToComparableFormat(_refDate), _refDateL,
                    "OK");
            },

            function (test) {
                test.equal(gpf.dateToComparableFormat(_refDate, false),
                    _refDateS, "OK");
            }

        ],

        "dateFromComparableFormat": [

            function (test) {
                var date = gpf.dateFromComparableFormat(_refDateL);
                test.equal(gpf.dateToComparableFormat(date),
                    _refDateL, "OK");
            },

            function (test) {
                var date = gpf.dateFromComparableFormat(_refDateS);
                test.equal(gpf.dateToComparableFormat(date, false),
                    _refDateS, "OK");
            }

        ]

    });

})(); /* End of privacy scope */
