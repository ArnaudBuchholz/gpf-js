(function () { /* Begin of privacy scope */
    "use strict";

    var
        Movie = gpf.define("Movie", {

            "[Class]": [gpf.$XmlElement("movie")],

            // The XMLAttribute allows to set the name of the attribute
            "[_imdbTitle]": [gpf.$XmlAttribute("imdb-title")],
            _imdbTitle: "",

            // By default, privates are serialized without _ as attributes
            _rating: 0.0,
            _title: "",

            // The XmlElement allows to serialize the value as an element,
            // using a specific name and/or type
            "[_releaseDate]": [gpf.$XmlElement("release", Date)],
            _releaseDate: null,

            /*
             * XmlList indicates that the member will contain several values
             * An array member also indicates the same thing
             * The list may be introduced with a specific tag
             * (here script-writers)
             * Each object in the array is saved as an element
             */
            "[_scriptwriters]": [ gpf.$XmlList("script-writers"),
                gpf.$XmlElement("name") ],
            _scriptwriters: [],

            // Functions are ignored
            // init *must* not have any arguments to be loadable
            constructor: function () {
            }

        }),

        starshipTroopers = gpf.extend(new Movie(), {
            _title: "Starship Troopers",
            _releaseDate: new Date(1997, 6, 11),
            _rating: 6.9,
            _imdbTitle: "tt0120201",
            _scriptwriters: [ "Edward Neumeier", "Robert A. Heinlein" ]
        }),

        starshipTroopersXML = "<movie imdb-title=\"tt0120201\" "
            + "rating=\"6.9\" title=\"Starship Troopers\"><release>"
            + "1997-07-11 00:00:00</release><script-writers><name>"
            + "Edward Neumeier</name><name>Robert A. Heinlein</name>"
            + "</script-writers></movie>",

        _createStarshipTroopersXML = function (contentHandler, callback) {
            var
                WXmlContentHandler =
                    gpf.interfaces.wrap(gpf.interfaces.IXmlContentHandler),
                wrapper = new WXmlContentHandler(contentHandler);
            wrapper
                .startDocument()
                .startElement("", "movie", "movie", {
                    "imdb-title": "tt0120201",
                    rating: "6.9",
                    title: "Starship Troopers"
                })
                .startElement("", "release")
                .characters("1997-07-11 00:00:00")
                .endElement()
                .startElement("", "script-writers")
                .startElement("", "name")
                .characters("Edward Neumeier")
                .endElement()
                .startElement("", "name")
                .characters("Robert A. Heinlein")
                .endElement()
                .endElement()
                .endElement()
                .endDocument()
                .$finally(callback);
        }
    ;

    gpf.declareTests({

        "attributes": [

            function (test) {
                test.title("Check the way attributes are set on the class");
                var
                    movie = new Movie(),
                    map = (new gpf.attributes.Map(movie))
                        .filter(gpf.attributes.XmlAttribute),
                    members = map.members(),
                    idx, member,
                    array, interfaceImplement;
                test.log("Found " + members.length + " members");
                for (idx = 0; idx < members.length; ++idx) {
                    member = members[idx];
                    array = map.member(member);
                    test.log("[" + idx + "] '" + member + "' "
                        + array.length());
                    if ("_scriptwriters" === member) {
                        test.equal(array.length(), 2, "Expected two");
                    } else {
                        test.equal(array.length(), 1, "Expected one");
                    }
                }
                // Have a look on InterfaceImplement
                array = (new gpf.attributes.Map(movie))
                    .filter(gpf.attributes.InterfaceImplementAttribute)
                    .member("Class");
                test.equal(array.length(), 3);
                // We should have IUnknown & IXmlContentHandler only
                for (idx = 0; idx < array.length(); ++idx) {
                    interfaceImplement = array.get(idx);
                    if (interfaceImplement.which() !== gpf.interfaces.IUnknown
                        && interfaceImplement.which()
                           !== gpf.interfaces.IXmlContentHandler
                        && interfaceImplement.which()
                            !== gpf.interfaces.IXmlSerializable) {
                        test.assert(false,
                            "Found unexpected implemented interface");
                    }
                }
            }

        ],

        "writer": [

            function (test) {
                test.title("Manipulate IXmlContentHandler to generate an XML");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                test.wait();
                _createStarshipTroopersXML(contentHandler, function() {
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"),
                            starshipTroopersXML, "XML is well formed");
                        test.done();
                    });
                });
            }
        ],

        "toXml": [

            function (test) {
                test.title("Use toXML to generate an XML");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                test.wait();
                starshipTroopers.toXml(contentHandler, function (event) {
                    test.equal(event.type(), "ready", "Ended properly");
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"),
                            starshipTroopersXML, "XML is well formed");
                        test.done();
                    });
                });
            }

        ],

        "fromXml": [

            function (test) {
                test.title("Use fromXML to create an object");
                var
                    movie,
                    contentHandler;
                movie = new Movie();
                contentHandler = gpf.interfaces.query(movie,
                    gpf.interfaces.IXmlContentHandler);
                test.wait();
                _createStarshipTroopersXML(contentHandler, function() {
                    test.like(movie, starshipTroopers);
                    test.done();
                });
            }

        ],

        "convert": [

            function (test) {
                test.title("Use convert on a IXMLSerializable object");
                var
                    stream = gpf.stringToStream(),
                    out = new gpf.xml.Writer(stream);
                test.wait();
                gpf.xml.convert(starshipTroopers, out, function (event) {
                    test.equal(event.type(), "ready", "Completed");
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"), starshipTroopersXML,
                            "XML is well formed");
                        test.done();
                    });
                });
            },

            function (test) {
                test.title("Use convert on a simple object");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                test.wait();
                gpf.xml.convert({
                    attribute1: "string",
                    attribute2: 1234,
                    subNode1: {
                        atribute3: "3"
                    },
                    subNode2: [
                        "a", {
                            attribute4: "b"
                        },
                        "c"
                    ]
                }, contentHandler, function (event) {
                    test.equal(event.type(), "ready", "Completed");
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"), "<root attribute1=\"" +
                            "string\" attribute2=\"1234\"><subNode1 atribute3" +
                            "=\"3\"/><subNode2><item>a</item><item attribute4" +
                            "=\"b\"/><item>c</item></subNode2></root>", "XML " +
                            "is well formed");
                        test.done();
                    });
                });
            },

            function (test) {
                test.title("Use convert on a simple object (for make)");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                gpf.xml.convert({"leadingComments": [
                    {
                        "type": "Line",
                        "value": " Universal Module Definition (UMD) to suppo" +
                            "rt AMD, CommonJS/Node.js,",
                        "range": {
                            "0": 82,
                            "1": 152
                        },
                        "extendedRange": [
                            74,
                            200
                        ]
                    },
                    {
                        "type": "Line",
                        "value": " Rhino, and plain browser loading.",
                        "range": {
                            "0": 158,
                            "1": 194
                        },
                        "extendedRange": [
                            74,
                            200
                        ]
                    }
                ]}, contentHandler, function () {
                    gpf.stringFromStream(stream, function (event) {
                        test.equal(event.get("buffer"), "<root><leadingComme" +
                            "nts><item type=\"Line\" value=\" Universal Modul" +
                            "e Definition (UMD) to support AMD, CommonJS/Node" +
                            ".js,\"><range _0=\"82\" _1=\"152\"/><extendedRan" +
                            "ge><item>74</item><item>200</item></extendedRang" +
                            "e></item><item type=\"Line\" value=\" Rhino, and" +
                            " plain browser loading.\"><range _0=\"158\" _1=" +
                            "\"194\"/><extendedRange><item>74</item><item>200" +
                            "</item></extendedRange></item></leadingComments>" +
                            "</root>", "XML is well formed");
                    });
                });
            }

        ]

    });

})(); /* End of privacy scope */
