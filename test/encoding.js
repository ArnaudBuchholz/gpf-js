(function () { /* Begin of privacy scope */
    "use strict";

    var
        _utf8String = "UTF-8 (abréviation de l’anglais Universal Character Set "
                    + "Transformation Format - 8 bits) est un codage de caractè"
                    + "res informatiques conçu pour coder l’ensemble des caract"
                    + "ères du « répertoire universel de caractères codés », in"
                    + "itialement développé par l’ISO dans la norme internation"
                    + "ale ISO/CEI 10646, aujourd’hui totalement compatible ave"
                    + "c le standard Unicode, en restant compatible avec la nor"
                    + "me ASCII limitée à l’anglais de base (et quelques autres"
                    + " langues beaucoup moins fréquentes), mais très largement"
                    + " répandue depuis des décennies.",

        // Obtained using notepad and saving using UTF-8
        _utf8Code = "5554462D382028616272C3A976696174696F6E206465206CE28099616E"
                    + "676C61697320556E6976657273616C20436861726163746572205365"
                    + "74205472616E73666F726D6174696F6E20466F726D6174202D203820"
                    + "62697473292065737420756E20636F64616765206465206361726163"
                    + "74C3A872657320696E666F726D6174697175657320636F6EC3A77520"
                    + "706F757220636F646572206CE28099656E73656D626C652064657320"
                    + "636172616374C3A872657320647520C2AB2072C3A9706572746F6972"
                    + "6520756E6976657273656C20646520636172616374C3A87265732063"
                    + "6F64C3A97320C2BB2C20696E697469616C656D656E742064C3A97665"
                    + "6C6F7070C3A920706172206CE2809949534F2064616E73206C61206E"
                    + "6F726D6520696E7465726E6174696F6E616C652049534F2F43454920"
                    + "31303634362C2061756A6F757264E2809968756920746F74616C656D"
                    + "656E7420636F6D70617469626C652061766563206C65207374616E64"
                    + "61726420556E69636F64652C20656E2072657374616E7420636F6D70"
                    + "617469626C652061766563206C61206E6F726D65204153434949206C"
                    + "696D6974C3A96520C3A0206CE28099616E676C616973206465206261"
                    + "736520286574207175656C7175657320617574726573206C616E6775"
                    + "65732062656175636F7570206D6F696E73206672C3A97175656E7465"
                    + "73292C206D616973207472C3A873206C617267656D656E742072C3A9"
                    + "70616E64756520646570756973206465732064C3A963656E6E696573"
                    + "2E",

        _utf8Buffer = (function() {
            var
                len = _utf8Code.length,
                idx,
                result = [];
            for (idx = 0; idx < len; idx += 2) {
                result.push(gpf.bin.fromHexa(_utf8Code.substr(idx, 2)));
            }
            return result;
        })();

    gpf.declareTests({

        "utf-8": [

            function (test) {
                test.title("Encode to UTF-8");
                var
                    input = gpf.stringToStream(_utf8String),
                    encoder = gpf.encoding.createEncoder(input,
                        gpf.encoding.UTF_8);
                test.wait();
                gpf.arrayFromStream(encoder, function (event) {
                    var result;
                    test.equal(event.type(),
                        gpf.interfaces.IReadableStream.EVENT_DATA,
                        "Stream is ready");
                    result = event.get("buffer");
                    test.like(_utf8Buffer, result, "Same buffer");
                    test.done();
                });
            },

            function (test) {
                test.title("Decode from UTF-8");
                var
                    input = gpf.arrayToStream(_utf8Buffer),
                    decoder = gpf.encoding.createDecoder(input,
                        gpf.encoding.UTF_8);
                test.wait(100);
                gpf.stringFromStream(decoder, function (event) {
                    var result;
                    test.equal(event.type(),
                        gpf.interfaces.IReadableStream.EVENT_DATA,
                        "Stream is ready");
                    result = event.get("buffer");
                    test.equal(_utf8String, result, "Same buffer");
                    test.done();
                });
            }

        ]

    });

})(); /* End of privacy scope */
