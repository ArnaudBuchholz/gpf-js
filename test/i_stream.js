"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

describe("i_stream", function () {

    describe("IReadableStream", function () {
        it("is a known and static interface", function () {
            /*jshint unused:false*/
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                read: function (size, eventsHandler) {}
            }, gpf.interfaces.IReadableStream));
            /*jshint unused:true*/
            /*eslint-enable no-unused-vars*/
        });
    });

    describe("IWritableStream", function () {
        it("is a known and static interface", function () {
            /*jshint unused:false*/
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                write: function (buffer, eventsHandler) {}
            }, gpf.interfaces.IWritableStream));
            /*jshint unused:true*/
            /*eslint-enable no-unused-vars*/
        });
    });

    describe("IStream", function () {
        it("is a known and static interface", function () {
            /*jshint unused:false*/
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                read: function (size, eventsHandler) {},
                write: function (buffer, eventsHandler) {}
            }, gpf.interfaces.IStream));
            /*jshint unused:true*/
            /*eslint-enable no-unused-vars*/
        });
    });

});
