(function () { /* Begin of privacy scope */

    gpf.declareTests({

        pow: [

            function (test) {
                test.title("First powers of 2");
                test.equal(gpf.bin.pow2(0), 1, "0");
                test.equal(gpf.bin.pow2(1), 2, "1");
                test.equal(gpf.bin.pow2(2), 4, "2");
                test.equal(gpf.bin.pow2(3), 8, "3");
                test.equal(gpf.bin.pow2(4), 16, "4");
                test.equal(gpf.bin.pow2(5), 32, "5");
                test.equal(gpf.bin.pow2(6), 64, "6");
                test.equal(gpf.bin.pow2(7), 128, "7");
                test.equal(gpf.bin.pow2(8), 256, "8");
                test.equal(gpf.bin.pow2(9), 512, "9");
                test.equal(gpf.bin.pow2(10), 1024, "10");
                test.equal(gpf.bin.pow2(11), 2048, "11");
                test.equal(gpf.bin.pow2(12), 4096, "12");
                test.equal(gpf.bin.pow2(13), 8192, "13");
                test.equal(gpf.bin.pow2(14), 16384, "14");
                test.equal(gpf.bin.pow2(15), 32768, "15");
                test.equal(gpf.bin.pow2(16), 65536, "16");
            },

            function (test) {
                test.title("Check if powers of 2");
                test.equal(gpf.bin.isPow2(0), -1, "-1");
                test.equal(gpf.bin.isPow2(1), 0, "0");
                test.equal(gpf.bin.isPow2(2), 1, "1");
                test.equal(gpf.bin.isPow2(4), 2, "2");
                test.equal(gpf.bin.isPow2(8), 3, "3");
                test.equal(gpf.bin.isPow2(16), 4, "4");
                test.equal(gpf.bin.isPow2(32), 5, "5");
                test.equal(gpf.bin.isPow2(64), 6, "6");
                test.equal(gpf.bin.isPow2(128), 7, "7");
                test.equal(gpf.bin.isPow2(256), 8, "8");
                test.equal(gpf.bin.isPow2(512), 9, "9");
                test.equal(gpf.bin.isPow2(1024), 10, "10");
                test.equal(gpf.bin.isPow2(2048), 11, "11");
                test.equal(gpf.bin.isPow2(4096), 12, "12");
                test.equal(gpf.bin.isPow2(8192), 13, "13");
                test.equal(gpf.bin.isPow2(16384), 14, "14");
                test.equal(gpf.bin.isPow2(32768), 15, "15");
                test.equal(gpf.bin.isPow2(32748), -1, "-1");
                test.equal(gpf.bin.isPow2(65536), 16, "16");
                test.equal(gpf.bin.isPow2(65534), -1, "-1");
            }
        ],

        baseANY: [

            function (test) {
                test.title("Encoding part: base 16 and 64 ");
                test.equal(gpf.bin.toHexa(2882400152),
                    "ABCDEF98", "Hexa: no padding");
                test.equal(gpf.bin.toHexa(2882400152, 4),
                    "ABCDEF98", "Hexa: padding set to too small");
                test.equal(gpf.bin.toHexa(-1, 8),
                    "FFFFFFFF", "Hexa: -1");
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
