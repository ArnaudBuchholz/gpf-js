"use strict";

describe("require", function () {

    before(function () {
        gpf.require.configure({
            base: "/test/require"
        });
    });

    describe("gpf.require.resolve", function () {

        it("resolves relative path", function () {
            assert(gpf.require.resolve("file.js") === "/test/require/file.js");
        });

        it("resolves relative path with folders", function () {
            assert(gpf.require.resolve("folder/file.js") === "/test/require/folder/file.js");
        });

        it("resolves relative path with folders", function () {
            assert(gpf.require.resolve("../file.js") === "/test/file.js");
        });

    });

    describe("gpf.require", function () {

        it("loads JSON file as an object", function (done) {
            gpf.require({
                data: "data.json"
            }, function (require) {
                try {
                    assert("object" === typeof require.data);
                    assert("value" === require.data.member);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it("handles NodeJS modules", function (done) {
            gpf.require({
                node: "nodejs.js"
            }, function (require) {
                try {
                    assert("object" === typeof require.node);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it("handles gpf.require modules", function (done) {
            gpf.require({
                test: "require.js"
            }, function (require) {
                try {
                    assert("object" === typeof require.test);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

        it("caches loaded parts", function (done) {
            gpf.require({
                data: "data.json"
            }, function (require) {
                require.data.additional = true;
                gpf.require({
                    data2: "data.json"
                }, function (cachedRequire) {
                    try {
                        assert(true === cachedRequire.data2.additional);
                        done();
                    } catch (e) {
                        done(e);
                    }
                });
            });
        });

    });

    describe("gpf.require.cache", function () {

        it("allows injection", function (done) {
            var fakeData = {
                member: "value2"
            };
            gpf.require.cache(gpf.require.resolve("data.json"), fakeData);
            gpf.require({
                data: "data.json"
            }, function (require) {
                try {
                    assert(fakeData === require.data);
                    done();
                } catch (e) {
                    done(e);
                }
            });
        });

    });

});
