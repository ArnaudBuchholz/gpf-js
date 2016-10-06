"use strict";

describe("define/definition/visibility", function () {

    if (gpf.internals) {

        var _GPF_VISIBILITY = gpf.internals._GPF_VISIBILITY,
            _gpfVisibilityFromKeyword = gpf.internals._gpfVisibilityFromKeyword;

        it("recognizes standard visibility keywords", function () {
            assert(_gpfVisibilityFromKeyword("public") === _GPF_VISIBILITY.PUBLIC);
            assert(_gpfVisibilityFromKeyword("protected") === _GPF_VISIBILITY.PROTECTED);
            assert(_gpfVisibilityFromKeyword("private") === _GPF_VISIBILITY.PRIVATE);
            assert(_gpfVisibilityFromKeyword("static") === _GPF_VISIBILITY.STATIC);
        });

        it("ignores any other keywords", function () {
            assert(_gpfVisibilityFromKeyword("PUBLIC") === _GPF_VISIBILITY.UNKNOWN);
            assert(_gpfVisibilityFromKeyword("toString") === _GPF_VISIBILITY.UNKNOWN);
            assert(_gpfVisibilityFromKeyword("") === _GPF_VISIBILITY.UNKNOWN);
        });

    }

});
