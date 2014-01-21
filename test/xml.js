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
                    movie = new Movie(),
                    parser = new gpf.xml.Parser(movie);
                parser.write(starshipTroopersXML, null);
                test.equal(movie, starshipTroopers);
            }

        ]

    });

})();
/* End of privacy scope */
