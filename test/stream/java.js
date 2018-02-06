"use strict";

describe("stream/java", function () {

    if (gpf.hosts.rhino === gpf.host()) {

        describe("gpf.java.ReadableStream", function () {

            it("forwards any error", function (done) {
                var iReadableStream = new gpf.java.ReadableStream({
                        close: function () {}
                    }),
                    iWritableStream = {
                        _ignore: function () {},
                        write: function (data) {
                            this._ignore(data);
                        }
                    };
                iReadableStream.read(iWritableStream)
                    .then(function () {
                        done(new Error("Not expected"));
                    }, function (error) {
                        try {
                            assert(error);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    });
            });

        });

    }

});
