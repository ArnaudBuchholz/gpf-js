"use strict";

const
    fs = require("fs"),
    sources = JSON.parse(fs.readFileSync("./src/sources.json"))
        .map(source => source.name);

let
    errorCount = 0,
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
        this._umdLineIndex = undefined;
    }

    error (text) {
        console.error(`[${this.name}] ${text}`);
        ++errorCount;
    }

    analyze () {
        this.lines.every(this._dispatchLine, this);
        if (this._umdLineIndex === undefined) {
            this.error("missing /*#ifndef(UMD)*/");
        }
    }

    _dispatchLine (line, lineIndex) {
        const NEXT_LINE = 1;
        if (this._umdLineIndex === undefined) {
            return this._checkLine0(line, lineIndex);
        }
        if (lineIndex === this._umdLineIndex + NEXT_LINE) {
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
        if (line.startsWith("/*global ")) {
            return this._processImport(line, lineIndex);
        }
        if (line.startsWith("/*exported ")) {
            return this._processExport(line, lineIndex);
        }
        if (line.includes("eslint") || line.includes("jshint")) {
            // ignore
            return true;
        }
        const ZERO_TO_ONE_BASED = 1;
        this.error(`line ${lineIndex + ZERO_TO_ONE_BASED} not recognized`);
        return false;
    }

    // global found
    _processImport (line, lineIndex) {
        const
            match = (/\/\*global ([\w_]+)(:true)?\*\//).exec(line),
            NAME = 1,
            WRITABLE = 2,
            name = match[NAME];
        if (match[WRITABLE]) {
            this.writableImport[name] = true;
        }
        this.imports.push(name);
        this.filteredLines.push(lineIndex);
        return true;
    }

    // exported found
    _processExport (line, lineIndex) {
        const
            match = (/\/\*exported ([\w_]+)\*\/ \/\/ (.+)/).exec(line),
            NAME = 1,
            DESCRIPTION = 2,
            name = match[NAME],
            description = match[DESCRIPTION];
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
        const
            SKIP_USESTRICT = 2,
            DONT_REMOVE = 0;
        let before = this.lines.join("\n"),
            lines = this.lines.filter((line, lineIndex) => !this.filteredLines.includes(lineIndex)),
            spliceArgs = [this._umdLineIndex + SKIP_USESTRICT, DONT_REMOVE],
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

if (!errorCount) {
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
            if (!dependsOn.includes(depOnModuleName)) {
                dependsOn.push(depOnModuleName);
            }
        });
        if (dependsOn.length) {
            dependencies[source] = dependsOn;
        }
    }
});

fs.writeFileSync("./build/dependencies.json", JSON.stringify(dependencies, null, "    "));

process.exit(-errorCount);
