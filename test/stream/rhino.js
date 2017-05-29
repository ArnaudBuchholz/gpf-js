"use strict";

describe("stream/rhino", function () {

    if (gpf.hosts.rhino === gpf.host()) {

        describe("gpf.rhino.ReadableStream", function () {

            it("forwards any error", function (done) {
                var iReadableStream = new gpf.rhino.ReadableStream({
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
