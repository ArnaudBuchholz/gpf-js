"use strict";

describe("stream/node", function () {

    function NodeMockedStream () {
        this._events = {};
    }

    NodeMockedStream.prototype = {

        _events: {},

        _fire: function (event) {
            var parameters = [].slice.call(arguments, 1);
            this._events[event].apply(null, parameters);
        },

        on: function (event, callback) {
            assert(!this._events[event]);
            this._events[event] = callback;
            return this;
        },

        once: function (event, callback) {
            return this.on(event, function () {
                callback();
                delete this._events[event];
            }.bind(this));
        }

    };

    if (gpf.hosts.nodejs === gpf.host()) {

        describe("gpf.node.ReadableStream", function () {

            it("configures the stream by hooking the events", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iReadableStream = new gpf.node.ReadableStream(mockedStream),
                    iWritableString = new gpf.stream.WritableString();
                assert(typeof mockedStream._events.error === "function");
                iReadableStream.read(iWritableString)
                    .then(done, done);
                assert(typeof mockedStream._events.data === "function");
                assert(typeof mockedStream._events.end === "function");
                mockedStream._fire("end");
            });

            it("supports several read events", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iReadableStream = new gpf.node.ReadableStream(mockedStream),
                    iWritableString = new gpf.stream.WritableString();
                iReadableStream.read(iWritableString)
                    .then(function () {
                        assert(iWritableString.toString() === "Hello World");
                    })
                    .then(done, done);
                // 'Simple' state engine to simulate data flow
                var paused = false,
                    step = 0;
                mockedStream.pause = function () {
                    assert(!paused);
                    paused = true;
                };
                mockedStream.resume = function () {
                    assert(paused);
                    paused = false;
                    setTimeout(function () {
                        ++step;
                        if (step === 1) {
                            mockedStream._fire("data", "World");
                        } else {
                            mockedStream._fire("end");
                        }
                    }, 0);
                };
                mockedStream._fire("data", "Hello ");
            });

            it("handles errors", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iReadableStream = new gpf.node.ReadableStream(mockedStream),
                    iWritableString = new gpf.stream.WritableString();
                iReadableStream.read(iWritableString)
                    .then(function () {
                        assert(false);
                    })
                    .then(undefined, function (e) {
                        assert(e === "error");
                    })
                    .then(done, done);
                // 'Simple' state engine to simulate data & error flow
                var paused = false;
                mockedStream.pause = function () {
                    assert(!paused);
                    paused = true;
                };
                mockedStream.resume = function () {
                    assert(paused);
                    paused = false;
                    setTimeout(function () {
                        mockedStream._fire("error", "error");
                    }, 0);
                };
                mockedStream._fire("data", "Hello ");
            });

            it("handles errors of write stream", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iReadableStream = new gpf.node.ReadableStream(mockedStream),
                    iMockedWritableStream = {
                        write: function (buffer) {
                            return Promise.reject(buffer);
                        }
                    };
                mockedStream.pause = function () {};
                iReadableStream.read(iMockedWritableStream)
                    .then(function () {
                        assert(false); // Should not succeed
                    }, function (e) {
                        assert(e === "error");
                    })
                    .then(done, done);
                mockedStream._fire("data", "error");
            });

            it("prevents any subsequent use when an error occurred", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iReadableStream = new gpf.node.ReadableStream(mockedStream),
                    iWritableString = new gpf.stream.WritableString();
                iReadableStream.read(iWritableString)
                    .then(function () {
                        assert(false);
                    })
                    .then(undefined, function (e) {
                        assert(e === "error");
                        return iReadableStream.read(iWritableString);
                    })
                    .then(undefined, function (e) {
                        assert(e instanceof gpf.Error.InvalidStreamState);
                    })
                    .then(done, done);
                mockedStream._fire("error", "error");
            });

            it("prevents any subsequent use when ended", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iReadableStream = new gpf.node.ReadableStream(mockedStream),
                    iWritableString = new gpf.stream.WritableString();
                iReadableStream.read(iWritableString)
                    .then(function () {
                        return iReadableStream.read(iWritableString);
                    })
                    .then(undefined, function (e) {
                        assert(e instanceof gpf.Error.InvalidStreamState);
                    })
                    .then(done, done);
                mockedStream._fire("end");
            });

        });

        describe("gpf.node.ReadableStream", function () {

            it("configures the stream by hooking the events", function () {
                var mockedStream = new NodeMockedStream(),
                    iWritableStream = new gpf.node.WritableStream(mockedStream);
                assert(typeof iWritableStream.write === "function"); // avoid JSHint error
                assert(typeof mockedStream._events.error === "function");
            });

            it("passes the buffer to the inner stream", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iWritableStream = new gpf.node.WritableStream(mockedStream);
                assert(typeof mockedStream._events.error === "function");
                mockedStream.write = function (buffer) {
                    assert(buffer === "Hello World");
                    return true;
                };
                iWritableStream.write("Hello World")
                    .then(done, done);
                assert(!mockedStream._events.drain);
            });

            it("supports several write calls", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iWritableStream = new gpf.node.WritableStream(mockedStream),
                    concatenatedBuffer = "";
                assert(typeof mockedStream._events.error === "function");
                mockedStream.write = function (buffer) {
                    concatenatedBuffer += buffer;
                    return true;
                };
                iWritableStream.write("Hello ")
                    .then(function () {
                        return iWritableStream.write("World");
                    })
                    .then(function () {
                        assert(concatenatedBuffer === "Hello World");
                    })
                    .then(done, done);
                assert(!mockedStream._events.drain);
            });

            it("waits for the drain event if the stream is full", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iWritableStream = new gpf.node.WritableStream(mockedStream),
                    drained = false;
                assert(typeof mockedStream._events.error === "function");
                mockedStream.write = function (buffer) {
                    assert(buffer === "Hello World");
                    return false;
                };
                iWritableStream.write("Hello World")
                    .then(function () {
                        assert(drained);
                        assert(!mockedStream._events.drain); // once has been used
                    })
                    .then(done, done);
                assert(typeof mockedStream._events.drain === "function");
                drained = true;
                mockedStream._fire("drain");
            });

            it("handles errors", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iWritableStream = new gpf.node.WritableStream(mockedStream);
                assert(typeof mockedStream._events.error === "function");
                mockedStream.write = function () {
                    mockedStream._fire("error", "error");
                };
                iWritableStream.write("Hello World")
                    .then(undefined, function (e) {
                        assert(e === "error");
                    })
                    .then(done, done);
            });

            it("prevents any subsequent use when an error occurred", function (done) {
                var mockedStream = new NodeMockedStream(),
                    iWritableStream = new gpf.node.WritableStream(mockedStream);
                assert(typeof mockedStream._events.error === "function");
                mockedStream.write = function () {
                    mockedStream._fire("error", "error");
                };
                iWritableStream.write("Hello World")
                    .then(undefined, function (e) {
                        assert(e === "error");
                        return iWritableStream.write("Hello World");
                    })
                    .then(undefined, function (e) {
                        assert(e instanceof gpf.Error.InvalidStreamState);
                    })
                    .then(done, done);
            });

        });

    }

});
