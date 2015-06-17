"use strict";
/*global describe, it, assert*/

describe("i_filestorage", function () {

    describe("IFileStorage", function () {
        it("is a known and static interface", function () {
            /* jshint unused:false */
            assert(gpf.interfaces.isImplementedBy({
                getInfo: function (path, eventsHandler) {},
                readAsBinaryStream: function (path, eventsHandler) {},
                writeAsBinaryStream: function (path, eventsHandler) {},
                close: function (stream) {},
                explore: function (path, eventsHandler) {},
                createFolder: function (path, eventsHandler) {},
                deleteFile: function (path, eventsHandler) {}
            }, gpf.interfaces.IFileStorage));
            /* jshint unused:true */
        });
    });

});
