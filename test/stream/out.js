"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("stream/out", function () {

    it("outputs on the console", function (done) {
        var
            gpfI = gpf.interfaces,
            out,
            wout;
        if (console.expects) {
            console.expects("log", "abcdef", false);
            console.expects("log", "hi", false);
        }
        out = new gpf.stream.Out();
        wout = new (gpfI.wrap(gpfI.IWritableStream))(out);
        wout
            .write("abc")
            .write("de")
            .write("f\r\nhi")
            .write("\n")
            .$finally(function () {
                // TODO check if console exception works fine
                done();
            });
    });

});
