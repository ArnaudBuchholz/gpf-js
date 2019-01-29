"use strict";

/*jshint camelcase: false */
/*eslint-disable camelcase*/

const
    fs = require("fs"),
    path = require("path"),
    ConfigFile = require("./configFile.js"),
    configFile = new ConfigFile(true),
    uglify = require("uglify-es"),
    options = {
        parse: {
            ecma: 8
        },
        mangle: {
            keep_classnames: true
        },
        output: {
            ecma: 8,
            ie8: false,
            inline_script: true,
            keep_quoted_props: true
        }
    },
    outPath = path.join(__dirname, "../tmp/build/testIncludes.js"),
    includes = {},
    indent = 8;

configFile.content.files.testInclude.forEach(source => {
    const NAME = 1;
    includes[source.match(/^test\/(.*)\.js$/)[NAME]]
      = uglify.minify(fs.readFileSync(path.join(__dirname, `../${source}`)).toString(), options).code;
});

let
    testIncludes = `(function () {
    "use strict";

    var safeFunc = Function,
        context = safeFunc("return this;")(),
        _includes = ${JSON.stringify(includes, undefined, indent)};

    context.include = function (source) {
        eval(_includes[source]);
    };

}());`;

fs.writeFileSync(outPath, testIncludes);
