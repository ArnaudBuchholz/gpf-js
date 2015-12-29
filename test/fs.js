"use strict";
/*jshint mocha: true*/
/*eslint-env mocha*/
/*global assert*/

/*eslint-disable max-nested-callbacks*/

describe("fs", function () {

    var testFolder = {
        data: {
            "file.bin": {
                _size: 256
            }
        },
        unknown: {
            sub: {
                unknownType: {
                    _fileInfo: {
                        type: gpf.fs.TYPE_UNKNOWN,
                        size: 0,
                        fileName: "unknownType",
                        filePath: "test/unknown/sub/unknownType",
                        createdDateTime: new Date(),
                        modifiedDateTime: new Date()
                    }
                }
            }
        },
        error: {
            noFileInfo: {
                _fileInfo: null
            }
        }
    };

    function notImplemented (path, eventsHandler) {
        gpf.events.fire(gpf.events.EVENT_ERROR, {
            error: gpf.error.notImplemented()
        }, eventsHandler);
        return path; // so that it is used
    }

    function checkFileInfo (item, filePath) {
        var fileName = filePath.split("/").pop(),
            fileInfo;
        if (undefined === item._fileInfo) {
            fileInfo = item._fileInfo = {
                fileName: fileName,
                filePath: filePath,
                createdDateTime: new Date(),
                modifiedDateTime: new Date()
            };
            if (item._size) {
                fileInfo.type = gpf.fs.TYPE_FILE;
                fileInfo.size = item._size;
                delete item._size;
            } else {
                fileInfo.type = gpf.fs.TYPE_DIRECTORY;
                fileInfo.size = 0;
            }
        }
    }

    function getFromPath (path) {
        var parts = path.split("/"),
            item = testFolder,
            filePath,
            fileName;
        if (parts.shift() !== "test") {
            return undefined;
        }
        filePath = "test";
        checkFileInfo(item, filePath);
        while (0 < parts.length) {
            fileName = parts[0];
            if ("object" === typeof item[fileName]) {
                parts.shift();
                item = item[fileName];
                filePath = filePath + "/" + fileName;
                checkFileInfo(item, filePath);
            } else {
                return undefined;
            }
        }
        return item;
    }

    function getChildrenList (filePath) {
        var item = getFromPath(filePath),
            fileName,
            result = [];
        if (undefined !== item) {
            for (fileName in item) {
                if (item.hasOwnProperty(fileName) && "_fileInfo" !== fileName) {
                    checkFileInfo(item[fileName], filePath + "/" + fileName);
                    result.push(filePath + "/" + fileName);
                }
            }
        }
        return result;
    }

    var testStorage = {

        getInfo: function (path, eventsHandler) {
            var file = getFromPath(path),
                fileInfo;
            if (undefined === file) {
                fileInfo = {
                    type: gpf.fs.TYPE_NOT_FOUND
                };
            }  else {
                fileInfo = file._fileInfo;
            }
            if (fileInfo) {
                gpf.events.fire(gpf.events.EVENT_READY, {info: fileInfo}, eventsHandler);
            } else {
                gpf.events.fire(gpf.events.EVENT_ERROR, {error: "no file info"}, eventsHandler);
            }
        },

        readAsBinaryStream: notImplemented,
        writeAsBinaryStream: notImplemented,
        close: notImplemented,

        explore: function (path, eventsHandler) {
            if ("string" !== typeof path) {
                gpf.events.fire(gpf.events.EVENT_ERROR, {
                    error: gpf.Error.invalidParameter()
                }, eventsHandler);
                return;
            }
            // Force error to check error handling
            var list = getChildrenList(path),
                enumerator = gpf.internals._gpfFsExploreEnumerator(this, list); //eslint-disable-line no-invalid-this
            gpf.events.fire(gpf.events.EVENT_READY, {
                enumerator: enumerator
            }, eventsHandler);
        },

        createFolder: notImplemented,
        deleteFile: notImplemented,
        deleteFolder: notImplemented

    };

    if (gpf.internals) {

        describe("(internal)", function () {

            describe("_gpfFsExploreEnumerator", function () {

                it("helps building explore functions", function (done) {
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        testStorage.explore("test/data", eventHandler);
                    })
                        .then(function (event) {
                            assert(gpf.events.EVENT_READY === event.type);
                            var enumerator = event.get("enumerator");
                            assert(true === gpf.interfaces.isImplementedBy(enumerator, gpf.interfaces.IEnumerator));
                            done();

                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("supports reset", function (done) {
                    var enumerator,
                        firstFileInfo;
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        testStorage.explore("test/data", eventHandler);
                    })
                        .then(function (event) {
                            assert(gpf.events.EVENT_READY === event.type);
                            enumerator = event.get("enumerator");
                            // Move to first item in the enumeration
                            enumerator.reset();
                            return gpf.events.getPromiseHandler(function (eventHandler) {
                                if (enumerator.moveNext(eventHandler)) {
                                    gpf.fire.event(gpf.events.EVENT_DATA, eventHandler);
                                }
                            });
                        })
                        .then(function (event) {
                            assert(gpf.events.EVENT_DATA === event.type);
                            // First file info obtained
                            firstFileInfo = enumerator.current();
                            assert(null !== firstFileInfo);
                            // Back to first item in the enumeration
                            enumerator.reset();
                            return gpf.events.getPromiseHandler(function (eventHandler) {
                                if (enumerator.moveNext(eventHandler)) {
                                    gpf.fire.event(gpf.events.EVENT_DATA, eventHandler);
                                }
                            });
                        })
                        .then(function (event) {
                            assert(gpf.events.EVENT_DATA === event.type);
                            // Check that it is the same
                            assert(firstFileInfo === enumerator.current());
                            done();

                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("forwards errors (from explore)", function (done) {
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        testStorage.explore(null, eventHandler);
                    })
                        .then(function (event) {
                            assert(gpf.events.EVENT_ERROR !== event.type);

                        })["catch"](function (reason) {
                            try {
                                assert(gpf.Error.invalidParameter.CODE === reason.code);
                                done();

                            } catch (e) {
                                done(e);
                            }
                        });
                });

                it("forwards errors (from getInfo)", function (done) {
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        testStorage.explore("test/error", eventHandler);
                    })
                        .then(function (event) {
                            assert(gpf.events.EVENT_READY === event.type);
                            var enumerator = event.get("enumerator");
                            return gpf.events.getPromiseHandler(function (eventHandler) {
                                if (enumerator.moveNext(eventHandler)) {
                                    gpf.fire.event(gpf.events.EVENT_DATA, eventHandler);
                                }
                            });
                        })
                        .then(function (event) {
                            assert(gpf.events.EVENT_ERROR !== event.type);

                        })["catch"](function (reason) {
                            try {
                                assert("no file info" === reason);
                                done();

                            } catch (e) {
                                done(e);
                            }
                        });
                });

                it("provides an asynchronous enumerator", function (done) {
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        testStorage.explore("test/error", eventHandler);
                    })
                        .then(function (event) {
                            assert(gpf.events.EVENT_READY === event.type);
                            var enumerator = event.get("enumerator");
                            assert(false === enumerator.moveNext());
                            done();
                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("automates calling getInfo from file path", function (done) {
                    var results = [];
                    function endEnumCallback (event) {
                        try {
                            assert(gpf.events.EVENT_END_OF_DATA === event.type);
                            assert(1 === results.length);
                            done();
                        } catch (e) {
                            done(e);
                        }
                    }
                    testStorage.explore("test/data", function (event) {
                        try {
                            assert(gpf.events.EVENT_READY === event.type);
                            var enumerator = event.get("enumerator");
                            gpf.interfaces.IEnumerator.each(enumerator, function (fileInfo) {
                                try {
                                    assert("number" === typeof fileInfo.type);
                                    assert("string" === typeof fileInfo.fileName);
                                    assert("string" === typeof fileInfo.filePath);
                                    assert("number" === typeof fileInfo.size);
                                    assert(null === fileInfo.createdDateTime
                                           || fileInfo.createdDateTime instanceof Date);
                                    assert(null === fileInfo.modifiedDateTime
                                           || fileInfo.modifiedDateTime instanceof Date);
                                    results.push(fileInfo);
                                } catch (e) {
                                    done(e);
                                }

                            }, endEnumCallback);
                        } catch (e) {
                            done(e);
                        }
                    });
                });

            });

            describe("_gpfFsBuildFindMethod", function () {

                var _gpfFsBuildFindMethod = gpf.internals._gpfFsBuildFindMethod,
                    find;

                beforeEach(function () {
                    find = _gpfFsBuildFindMethod(testStorage);
                });

                it("builds a find method", function () {
                    assert("function" === typeof find);
                    assert(3 === find.length);
                });

                it("finds files using path matchers", function (done) {
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        find("test/data", "*.bin", eventHandler);
                    })
                        .then(function (event) {
                            assert(gpf.events.EVENT_DATA === event.type);
                            assert("file.bin" === event.get("path"));
                            done();

                        })["catch"](function (reason) {
                            done(reason);
                        });
                });

                it("forwards errors (initial getInfo)", function (done) {
                    gpf.events.getPromiseHandler(function (eventHandler) {
                        find("test/error/noFileInfo", "*.bin", eventHandler);
                    })
                        .then(function (/*event*/) {
                            assert(false);

                        })["catch"](function (reason) {
                            try {
                                assert("no file info" === reason);
                                done();

                            } catch (e) {
                                done(e);
                            }
                        });
                });

                it("forwards errors (during enumeration)", function (done) {
                    var errorRaised = false;
                    find("test", "*.dat", function (event) {
                        if (gpf.events.EVENT_ERROR === event.type) {
                            if (errorRaised) {
                                done(event);
                            } else {
                                errorRaised = true;
                            }

                        } else if (gpf.events.EVENT_END_OF_DATA === event.type) {
                            if (errorRaised) {
                                done();
                            } else {
                                done("Error was not raised");
                            }

                        }
                    });
                });

            });

        });

    }

    if (null === gpf.fs.host()) {
        return; // No host
    }

    describe("Data generator", function () {

        it("file.bin", function (done) {
            var fs = gpf.fs.host();
            fs.getInfo("test/data/file.bin", function (infoEvent) {
                if (infoEvent.type === gpf.events.EVENT_READY && infoEvent.get("info").type === gpf.fs.TYPE_FILE) {
                    done(); // Already exists
                    return;
                }
                // File does not exist, generates
                var count = 0,
                    wStream;
                function loop (event) {
                    assert(!event || gpf.events.EVENT_READY === event.type);
                    if (256 === count) {
                        fs.close(wStream, function () {});
                        done();
                    }
                    wStream.write([count++], loop);
                }
                // Current path is always root of gpf-js
                fs.writeAsBinaryStream("test/data/file.bin", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    wStream = event.get("stream");
                    loop();
                });
            });
        });

    });

    describe("gpf.fs.host", function () {

        var gpfI = gpf.interfaces,
            iFs;

        beforeEach(function () {
            iFs = gpf.fs.host();
        });

        it("gives access to a IFileStorage interface", function () {
            assert(null !== iFs);
            if (null !== iFs) {
                assert(gpfI.isImplementedBy(iFs, gpfI.IFileStorage));
            }
        });

        describe("getInfo", function () {

            function checkInfo (info) {
                assert(null !== info);
                assert("object" === typeof info);
                assert("number" === typeof info.type);
                assert("string" === typeof info.fileName);
                assert("string" === typeof info.filePath);
                assert("number" === typeof info.size);
                assert("object" === typeof info.createdDateTime);
                assert("object" === typeof info.modifiedDateTime);
            }

            it("tells if a file exists", function (done) {
                iFs.getInfo("src/fs.js", function (event) {
                    assert(event.type === gpf.events.EVENT_READY);
                    var info = event.get("info");
                    checkInfo(info);
                    assert(info.type === gpf.fs.TYPE_FILE);
                    assert(info.size > 0);
                    done();
                });
            });

            it("tells if a directory exists", function (done) {
                iFs.getInfo("src", function (event) {
                    assert(event.type === gpf.events.EVENT_READY);
                    var info = event.get("info");
                    checkInfo(info);
                    assert(info.type === gpf.fs.TYPE_DIRECTORY);
                    // size is not relevant
                    done();
                });
            });

            it("tells if a path does not exists", function (done) {
                iFs.getInfo("null", function (event) {
                    assert(event.type === gpf.events.EVENT_READY);
                    var info = event.get("info");
                    assert(null !== info);
                    assert("object" === typeof info);
                    assert(info.type === gpf.fs.TYPE_NOT_FOUND);
                    done();
                });
            });

        });

        function _close (stream) {
            iFs.close(stream, function () {}); // ignore
        }

        describe("readAsBinaryStream", function () {

            it("reads binary files", function (done) {
                iFs.readAsBinaryStream("test/data/file.bin", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var rStream = event.get("stream");
                    rStream.read(1, function (readEvent) {
                        assert(gpf.events.EVENT_DATA === readEvent.type);
                        var buffer = readEvent.get("buffer");
                        assert(1 === buffer.length);
                        assert(0 === buffer[0]);
                        _close(rStream);
                        done();
                    });
                });
            });

        });

        describe("writeAsBinaryStream", function () {

            it("writes binary files", function (done) {
                iFs.writeAsBinaryStream("tmp/test/fs_" + gpf.host() + ".bin", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var wStream = event.get("stream");
                    wStream.write([0, 34, 75, 0, 128, 255], function (writeEvent) {
                        assert(gpf.events.EVENT_READY === writeEvent.type);
                        _close(wStream);
                        done();
                    });
                });
            });

        });

        describe("explore", function () {

            it("fails on a file", function (done) {
                iFs.explore("src/fs.js", function (event) {
                    assert(gpf.events.EVENT_ERROR === event.type);
                    done();
                });
            });

            it("gets an IEnumerator on a folder", function (done) {
                iFs.explore("src", function (event) {
                    assert(gpf.events.EVENT_READY === event.type);
                    var enumerator = event.get("enumerator");
                    assert(null !== enumerator);
                    assert(gpf.interfaces.isImplementedBy(enumerator, gpf.interfaces.IEnumerator));
                    done();
                });
            });

        });

    });

});
