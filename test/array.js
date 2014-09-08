(function () { /* Begin of privacy scope */
    "use strict";

    gpf.declareTests({

        "toStream": [

            function (test) {
                test.title("Use of arrayToStream for reading");
                var array = [1, 2, 3],
                    stream = gpf.arrayToStream(array),
                    cb1 = function (event) {
                        test.log("First read callback");
                        test.equal(event.type(),
                            gpf.interfaces.IReadableStream.EVENT_DATA,
                            "Data event");
                        test.like(event.get("buffer"), [1, 2],
                            "Received 1, 2");
                        stream.read(2, cb2);
                    },
                    cb2 = function (event) {
                        test.log("Second read callback");
                        test.equal(event.type(),
                            gpf.interfaces.IReadableStream.EVENT_DATA,
                            "Data event");
                        test.like(event.get("buffer"), [3],
                            "Received 3");
                        stream.read(2, cb3);
                    },
                    cb3 = function (event) {
                        test.log("Third read callback");
                        test.equal(event.type(),
                            gpf.interfaces.IReadableStream.EVENT_END_OF_STREAM,
                            "End of stream event");
                        test.like(array, [1, 2, 3], "Original not altered");
                        test.done();
                    };
                test.wait(100);
                stream.read(2, cb1);
            },

            function (test) {
                test.title("Use of arrayToStream for writing");
                var stream = gpf.arrayToStream(),
                    cb1 = function (event) {
                        test.log("First write callback");
                        test.equal(event.type(),
                            gpf.interfaces.IWritableStream.EVENT_READY,
                            "Ready event");
                        stream.write([3], cb2);
                    },
                    cb2 = function (event) {
                        test.log("Second write callback");
                        test.equal(event.type(),
                            gpf.interfaces.IWritableStream.EVENT_READY,
                            "Ready event");
                        test.like(stream.consolidateArray(), [1, 2, 3],
                            "Result consolidated");
                        test.done();
                    };
                test.wait(100);
                stream.write([1, 2], cb1);
            }

        ],

        "fromStream": [

            function (test) {
                test.title("Using underlying array stream");
                var result,
                    stream = gpf.arrayToStream([1, 2, 3]);
                test.wait(100);
                result = gpf.arrayFromStream(stream, function (event) {
                    test.log("Callback");
                    test.equal(event.type(),
                        gpf.interfaces.IReadableStream.EVENT_DATA,
                        "Data event");
                    test.like(event.get("buffer"), [1, 2, 3],
                        "Result consolidated");
                    test.done();
                });
            }
        ]

    });

})(); /* End of privacy scope */