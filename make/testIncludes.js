"use strict";

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
          ecma             : 8,
          ie8              : false,
          inline_script    : true,
          keep_quoted_props: true
        }
    },
    outPath = path.join(__dirname, "../tmp/build/testIncludes.js"),
    includes = {};

configFile.content.files.testInclude.forEach(source => {
    includes[source.match(/^test\/(.*)\.js$/)[1]] =
      uglify.minify(fs.readFileSync(path.join(__dirname, `../${source}`)).toString(), options).code;
});

let
    testIncludes = `(function () {
    "use strict";

    var safeFunc = Function,
        context = safeFunc("return this;")(),
        _includes = ${JSON.stringify(includes, undefined, 8)};

    context.include = function (source) {
        eval(_includes[source]);
    };

}());`;

fs.writeFileSync(outPath, testIncludes);
