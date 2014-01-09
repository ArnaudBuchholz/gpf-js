(function () { /* Begin of privacy scope */

    gpf.declareTests({

        baseANY: [

            function (test) {
                test.title("Encoding part: base 16 and 64 ");
                test.equal(gpf.bin.toHexa(2882400152),
                    "ABCDEF98", "Hexa: no padding");
                test.equal(gpf.bin.toHexa(2882400152, 4),
                    "ABCDEF98", "Hexa: padding set to too small");
                test.equal(gpf.bin.toHexa(2882400152, 10),
                    "00ABCDEF98", "Hexa: padding set to larger");
                test.equal(gpf.bin.toBase64(2882400152), "Crze+Y",
                    "Base64: no padding");
                test.equal(gpf.bin.toBase64(2882400152, 8, "="), "==Crze+Y",
                    "Base64: padding set to larger");
            },

            function (test) {
                test.title("Decoding part: base 16 and 64 ");
                test.equal(gpf.bin.fromHexa("ABCDEF98", "0"), 2882400152,
                    "Hexa: no padding");
                test.equal(gpf.bin.fromHexa("00ABCDEF98"), 2882400152,
                    "Hexa: extra padding");
                test.equal(gpf.bin.fromBase64("Crze+Y"), 2882400152,
                    "Base64: no padding");
                test.equal(gpf.bin.fromBase64("==Crze+Y", "="), 2882400152,
                    "Base64: extra padding");
            }

        ]

    });

}()); /* End of privacy scope */
