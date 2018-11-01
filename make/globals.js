"use strict";

const
    fs = require("fs"),
    sources = JSON.parse(fs.readFileSync("./src/sources.json"))
        .map(source => source.name);

let
    rc = 0,
    rewrites = {};

class Module {

    constructor (name) {
        this.name = name;
        Module.byName[name] = this;
        this.lines = fs.readFileSync(`./src/${name}.js`).toString().split("\n");
        this.imports = [];
        this.writableImport = {};
        this.exports = {};
        this.filteredLines = [];
        this._umdLineIndex = -1;
    }

    error (text) {
        console.error(`[${this.name}] ${text}`);
        --rc;
    }

    analyze () {
        this.lines.every(this._dispatchLine, this);
        if (this._umdLineIndex === -1) {
            this.error("missing /*#ifndef(UMD)*/");
        }
    }

    _dispatchLine (line, lineIndex) {
        if (this._umdLineIndex === -1) {
            return this._checkLine0(line, lineIndex);
        }
        if (lineIndex === this._umdLineIndex + 1) {
            return this._checkLine1(line);
        }
        if (line === "/*#endif*/") {
            return false; // Stop
        }
        return this._analyzeLine(line, lineIndex);
    }

    // First line *must* be /*#ifndef(UMD)*/
    _checkLine0 (line, lineIndex) {
        if (line === "/*#ifndef(UMD)*/") {
            this._umdLineIndex = lineIndex;
        }
        return true;
    }

    // Second line *must* be "use strict";
    _checkLine1 (line) {
        if (line !== "\"use strict\";") {
            this.error("missing \"use strict\";");
            return false;
        }
        return true;
    }

    // Content line: select the proper handling
    _analyzeLine (line, lineIndex) {
        if (line.indexOf("/*global ") === 0) {
            return this._processImport(line, lineIndex);
        }
        if (line.indexOf("/*exported ") === 0) {
            return this._processExport(line, lineIndex);
        }
        if (line.indexOf("eslint") > -1 || line.indexOf("jshint") > -1) {
            // ignore
            return true;
        }
        this.error(`line ${lineIndex + 1} not recognized`);
        return false;
    }

    // global found
    _processImport (line, lineIndex) {
        let name = line.split("*/")[0].substr(9).trim(),
            modifiable;
        if (name.indexOf(":")) {
            name = name.split(":");
            modifiable = name[1] === "true";
            name = name[0];
            this.writableImport[name] = modifiable;
        }
        this.imports.push(name);
        this.filteredLines.push(lineIndex);
        return true;
    }

    // exported found
    _processExport (line, lineIndex) {
        let name = line.split("*/")[0].substr(11).trim(),
            description = line.split("// ")[1] || "";
        if (!description) {
            this.error(`no description for ${name}`);
        }
        this.exports[name] = description;
        Module.byExport[name] = this;
        this.filteredLines.push(lineIndex);
        return true;
    }

    // returns true if modified
    rebuild () {
        let before = this.lines.join("\n"),
            lines = this.lines.filter((line, lineIndex) => this.filteredLines.indexOf(lineIndex) === -1),
            spliceArgs = [this._umdLineIndex + 2, 0],
            after;
        this.imports.sort().forEach(name => {
            let module = Module.byExport[name];
            if (undefined === module) {
                this.error(`No export for '${name}'`);
                return;
            }
            let global = `/*global ${name}`;
            if (this.writableImport[name]) {
                global += ":true";
            }
            global += `*/ // ${module.exports[name]}`;
            spliceArgs.push(global);
        });
        Object.keys(this.exports)
            .sort()
            .forEach(name => spliceArgs.push(`/*exported ${name}*/ // ${this.exports[name]}`));
        [].splice.apply(lines, spliceArgs);
        after = lines.join("\n");
        if (before !== after) {
            rewrites[this.name] = after;
            return true;
        }
        return false;
    }

}

Module.byName = {};
Module.byExport = {};

// Collect information
sources.forEach(source => {
    let module = new Module(source);
    module.analyze();
});

// Rebuild - if necessary
sources.every(source => {
    let module = Module.byName[source];
    if (module.rebuild()) {
        console.log(source);
    }
    return true;
});

if (rc === 0) {
    Object.keys(rewrites).forEach(name => fs.writeFileSync(`./src/${name}.js`, rewrites[name]));
}

// Generates dependency graph
let dependencies = {
    boot: [] // No dependencies
};
sources.forEach(source => {
    let module = Module.byName[source],
        dependsOn;
    if (module.imports.length) {
        dependsOn = [];
        module.imports.forEach(name => {
            let depOnModuleName = Module.byExport[name].name;
            if (dependsOn.indexOf(depOnModuleName) === -1) {
                dependsOn.push(depOnModuleName);
            }
        });
        if (dependsOn.length > 0) {
            dependencies[source] = dependsOn;
        }
    }
});
fs.writeFileSync("./build/dependencies.json", JSON.stringify(dependencies, null, 4));

process.exit(rc);
