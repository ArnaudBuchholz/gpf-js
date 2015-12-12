"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("interfaces/filestorage", function () {

    describe("IFileStorage", function () {
        it("is a known and static interface", function () {
            /*jshint unused:false*/
            /*eslint-disable no-unused-vars*/
            assert(gpf.interfaces.isImplementedBy({
                getInfo: function (path, eventsHandler) {},
                readAsBinaryStream: function (path, eventsHandler) {},
                writeAsBinaryStream: function (path, eventsHandler) {},
                close: function (stream, eventsHandler) {},
                explore: function (path, eventsHandler) {},
                createFolder: function (path, eventsHandler) {},
                deleteFile: function (path, eventsHandler) {},
                deleteFolder: function (path, eventsHandler) {}
            }, gpf.interfaces.IFileStorage));
            /*jshint unused:true*/
        });
    });

});
