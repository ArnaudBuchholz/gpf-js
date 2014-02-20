(function () { /* Begin of privacy scope */
    "use strict";

    var
        Movie = gpf.Class.extend({

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
            init: function () {
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

        _createStarshipTroopersXML = function (contentHandler) {
            contentHandler.startDocument();
            contentHandler.startElement("", "movie", "movie", {
                "imdb-title": "tt0120201",
                rating: "6.9",
                title: "Starship Troopers"
            });
            contentHandler.startElement("", "release");
            contentHandler.characters("1997-07-11 00:00:00");
            contentHandler.endElement();
            contentHandler.startElement("", "script-writers");
            contentHandler.startElement("", "name");
            contentHandler.characters("Edward Neumeier");
            contentHandler.endElement();
            contentHandler.startElement("", "name");
            contentHandler.characters("Robert A. Heinlein");
            contentHandler.endElement();
            contentHandler.endElement();
            contentHandler.endElement();
            contentHandler.endDocument();
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
                _createStarshipTroopersXML(contentHandler);
                test.equal(gpf.stringFromStream(stream), starshipTroopersXML,
                    "XML is well formed");
            }
        ],

        "toXml": [

            function (test) {
                test.title("Use toXML to generate an XML");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                starshipTroopers.toXml(contentHandler);
                test.equal(gpf.stringFromStream(stream), starshipTroopersXML,
                    "XML is well formed");
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
                _createStarshipTroopersXML(contentHandler);
                test.like(movie, starshipTroopers);
            }

        ],

        "convert": [

            function (test) {
                test.title("Use convert on a IXMLSerializable object");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                gpf.xml.convert(starshipTroopers, contentHandler);
                test.equal(gpf.stringFromStream(stream), starshipTroopersXML,
                    "XML is well formed");
            },

            function (test) {
                test.title("Use convert on a simple object");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
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
                }, contentHandler);
                test.equal(gpf.stringFromStream(stream), "<root attribute1=\"st"
                    + "ring\" attribute2=\"1234\"><subNode1 atribute3=\"3\"/><s"
                    + "ubNode2>a</subNode2><subNode2><item attribute4=\"b\"/></"
                    + "subNode2><subNode2>c</subNode2></root>",
                    "XML is well formed");
            },

            function (test) {
                test.title("Use convert on a simple object (for make)");
                var
                    stream = gpf.stringToStream(),
                    contentHandler = new gpf.xml.Writer(stream);
                gpf.xml.convert({"leadingComments": [
                    {
                        "type": "Line",
                        "value": " Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,",
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
                ]}, contentHandler);
                test.equal(gpf.stringFromStream(stream), "<root><leadingComment"
                    + "s><item type=\"Line\" value=\" Universal Module Definiti"
                    + "on (UMD) to support AMD, CommonJS/Node.js,\"><range _0="
                    + "\"82\" _1=\"152\"/><extendedRange>74</extendedRange><ext"
                    + "endedRange>200</extendedRange></item></leadingComments><"
                    + "leadingComments><item type=\"Line\" value=\" Rhino, and "
                    + "plain browser loading.\"><range _0=\"158\" _1=\"194\"/><"
                    + "extendedRange>74</extendedRange><extendedRange>200</exte"
                    + "ndedRange></item></leadingComments></root>",
                    "XML is well formed");
            }

        ]

    });

})(); /* End of privacy scope */
