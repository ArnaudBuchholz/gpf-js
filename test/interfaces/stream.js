"use strict";

describe("interfaces/stream", function () {

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

});
