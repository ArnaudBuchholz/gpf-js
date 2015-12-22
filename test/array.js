"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("array", function () {

    describe("gpf.arrayToStream", function () {

        it("can be used for reading", function (done) {
            var array = [1, 2, 3],
                stream = gpf.arrayToStream(array);
            gpf.events.getPromiseHandler(function (eventHandler) {
                stream.read(2, eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_DATA === event.type);
                    assert(true === gpf.like(event.get("buffer"), [1, 2]));
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        stream.read(2, eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_DATA === event.type);
                    assert(true === gpf.like(event.get("buffer"), [3]));
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        stream.read(2, eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_END_OF_DATA === event.type);
                    assert(true === gpf.like(array, [1, 2, 3])); // original not altered
                    done();
                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("can be used for writing", function (done) {
            var stream = gpf.arrayToStream();
            gpf.events.getPromiseHandler(function (eventHandler) {
                stream.write([1, 2], eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    return gpf.events.getPromiseHandler(function (eventHandler) {
                        stream.write([3], eventHandler);
                    });
                })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    assert(true === gpf.like(stream.toArray(), [1, 2, 3]));
                    done();
                })["catch"](function (reason) {
                    done(reason);
                });
        });

    });

    describe("gpf.arrayFromStream", function () {

        it("fills an array by reading a stream", function (done) {
            var stream = gpf.arrayToStream([1, 2, 3]);
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.arrayFromStream(stream, eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    assert(true === gpf.like(event.get("buffer"), [1, 2, 3]));
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
        });

    });

});
