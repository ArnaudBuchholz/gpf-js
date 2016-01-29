"use strict";

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

        it("converts immediately an ArrayStream to array", function (done) {
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

        it("fills an array by reading a stream", function (done) {
            var array = [0, 3475, "abc", false, true, null],
                stream = {
                    pos: 0,
                    read: function (count, eventsHandler) {
                        var result;
                        if (this.pos === array.length) {
                            gpf.events.fire.apply(this, [gpf.events.EVENT_END_OF_DATA, {}, eventsHandler]);
                        } else {
                            result = array.slice(this.pos++, this.pos);
                            gpf.events.fire.apply(this, [gpf.events.EVENT_DATA, {buffer: result}, eventsHandler]);
                        }
                    }
                };
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.arrayFromStream(stream, eventHandler);
            })
                .then(function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    assert(true === gpf.like(array, event.get("buffer")));
                    done();

                })["catch"](function (reason) {
                    done(reason);
                });
        });

        it("forwards errors", function (done) {
            var stream = {
                pos: 0,
                read: function (count, eventsHandler) {
                    if (0 === this.pos) {
                        ++this.pos;
                        gpf.events.fire.apply(this, [gpf.events.EVENT_DATA, {buffer: [0, 1, 2]}, eventsHandler]);
                    } else {
                        gpf.events.fire.apply(this, [gpf.events.EVENT_ERROR, {error: "KO"}, eventsHandler]);
                    }
                }
            };
            gpf.events.getPromiseHandler(function (eventHandler) {
                gpf.arrayFromStream(stream, eventHandler);
            })
                .then(function (/*event*/) {
                    done("Not supposed to work");

                })["catch"](function (reason) {
                    assert("KO" === reason);
                    done();
                });
        });

    });

});
