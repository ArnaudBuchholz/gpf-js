"use strict";

describe("regexp", function () {

    if (gpf.internals) {

        var _gpfRegExpTokenize = gpf.internals._gpfRegExpTokenize,
            parsingRegExp = new RegExp("\\s+|(\\/\\/)|(\\/)|(\\|)|(@)|(:)|(\\w+)", "g");

        describe("(internal)", function () {

            describe("_gpfRegExpTokenize", function () {

                it("extracts all matches", function () {
                    var matches = _gpfRegExpTokenize(parsingRegExp, "//a | //ns:div/@test");
                    assert(matches.length === 12);
                });

                it("qualifies all matches", function () {
                    var matches = _gpfRegExpTokenize(parsingRegExp, "//a | //ns:div/@test");
                    assert(matches[0].token === 1); // //
                    assert(matches[1].token === 6); // a
                    assert(matches[2].token === undefined); // space not captured
                    assert(matches[3].token === 3); // |
                    assert(matches[4].token === undefined); // space not captured
                    assert(matches[5].token === 1); // //
                    assert(matches[6].token === 6); // ns
                    assert(matches[7].token === 5); // :
                    assert(matches[8].token === 6); // div
                    assert(matches[9].token === 2); // /
                    assert(matches[10].token === 4); // @
                    assert(matches[11].token === 6); // test
                });

                it("removes non tokenized matches", function () {
                    var matches = _gpfRegExpTokenize(parsingRegExp, "//a | //ns:div/@test", true);
                    assert(matches.length === 10);
                    assert(matches[0].token === 1); // //
                    assert(matches[1].token === 6); // a
                    assert(matches[2].token === 3); // |
                    assert(matches[3].token === 1); // //
                    assert(matches[4].token === 6); // ns
                    assert(matches[5].token === 5); // :
                    assert(matches[6].token === 6); // div
                    assert(matches[7].token === 2); // /
                    assert(matches[8].token === 4); // @
                    assert(matches[9].token === 6); // test
                });
            });

        });

    }

});
