"use strict";

var esprima = require("esprima"),
    escodegen = require("escodegen"),
    identifierCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * AST Reducer
 *
 * @class ASTreducer
 */
var ASTreducer = function() {
    this._identifiers = {};
    this._identifiersStack = [];
};

ASTreducer.prototype = {

    /**
     * Process the AST to reduce the generated source
     *
     * @param {Object} ast
     */
    reduce: function (ast) {
        this._walk(ast);
    },

    //region AST processing APIs

    /**
     * Create new variable names for the provided name list.
     *
     * @param {String[]} names
     * @param {Boolean} forVariables
     */
    beginIdentifierMapping: function (names, forVariables) {
        //if (START_TRACES) {
        //    console.log(">> beginIdentifierMapping");
        //    if (forVariables) {
        //        console.log("\t+[VAR] " + names.join(","));
        //    } else {
        //        console.log("\t+[FUN] " + names.join(","));
        //    }
        //    for (idx = this._identifiersStack.length - 1;
        //         idx > 0; --idx) {
        //        var stackedNames = this._identifiersStack[idx];
        //        if (stackedNames.isVariables) {
        //            console.log("\t[VAR] " + stackedNames.join(","));
        //        } else {
        //            console.log("\t[FUN] " + stackedNames.join(","));
        //        }
        //    }
        //}
        var
            len = names.length,
            idx,
            name,
            newNames;
        if (forVariables) {
            names.isVariables = true;
        }
        names.identifierCount = this._identifierCount;
        this._identifiersStack.push(names);
        for (idx = 0; idx < len; ++idx) {
            name = " " + names[idx];
            newNames = this._identifiers[name];
            if (undefined === newNames) {
                newNames = this._identifiers[name] = [];
            }
            newNames.unshift(this._newName());
            //if (name === "gpf") {
            //    console.log("!!! gpf = " + this._identifiers[name]);
            //    START_TRACES = 5;
            //}
        }
    },

    /**
     * Roll back new variable names created with beginIdentifierMapping
     */
    endIdentifierMapping: function () {
        //if (START_TRACES) {
        //    console.log(">> endIdentifierMapping");
        //    for (idx = this._identifiersStack.length - 1;
        //         idx > 0; --idx) {
        //        names = this._identifiersStack[idx];
        //        if (names.isVariables) {
        //            console.log("\t[VAR] " + names.join(","));
        //        } else {
        //            console.log("\t[FUN] " + names.join(","));
        //        }
        //    }
        //}
        /*
         * Undo identifiers stack until a non 'isVariables' one is found
         */
        var
            stack = this._identifiersStack,
            names,
            len,
            idx,
            name,
            newNames;
        do {
            names = stack.pop();
            len = names.length;
            for (idx = 0; idx < len; ++idx) {
                name = " " + names[idx];
                newNames = this._identifiers[name];
                if (newNames.length === 1) {
                    delete this._identifiers[name];
                } else {
                    newNames.shift();
                }
            }
            this._identifierCount = names.identifierCount;
        } while (names.isVariables);
        //if (START_TRACES) {
        //    console.log("<< endIdentifierMapping");
        //    for (idx = this._identifiersStack.length - 1;
        //         idx > 0; --idx) {
        //        names = this._identifiersStack[idx];
        //        if (names.isVariables) {
        //            console.log("\t[VAR] " + names.join(","));
        //        } else {
        //            console.log("\t[FUN] " + names.join(","));
        //        }
        //    }
        //    START_TRACES--;
        //}
    },

    /**
     * Return the nmapped identifier (if any)
     *
     * @param {String} name
     * @returns {String|undefined}
     */
    isIdentifierMapped: function (name) {
        name = " " + name;
        if (this._identifiers.hasOwnProperty(name)) {
            return this._identifiers[name][0];
        }
        return undefined;
    },

    //endregion

    //region members

    /**
     * Stack of name arrays (corresponding to the cumulated calls to
     * beginIdentifierMapping)
     *
     * @type {String[][]}
     * @private
     */
    _identifiersStack: [],

    /**
     * Number of identifiers mapped
     *
     * @type {Number}
     * @private
     */
    _identifierCount: 0,

    /**
     * Dictionary of name to mapped identifiers (Array)
     * NOTE key is escaped to avoid collision with existing members.
     *
     * @type {Object}
     * @private
     */
    _identifiers: {},

    //endregion

    //region Internal methods

    /**
     * Explore the AST array and apply the necessary transformations
     *
     * @param {Array} astArray
     * @private
     */
    _walkArray: function (astArray) {
        var
            idx,
            subItem,
            names;
        // First pass to see if any FunctionDeclaration names
        for (idx = 0; idx < astArray.length; ++idx) {
            subItem = astArray[idx];
            if (subItem.type === "FunctionDeclaration") {
                if (undefined === names) {
                    names = [];
                }
                names.push(subItem.id.name);
            }
        }
        if (undefined !== names) {
            this.beginIdentifierMapping(names, true);
        }
        // Second pass to reduce
        for (idx = 0; idx < astArray.length; ++idx) {
            this._walk(astArray[idx]);
        }
    },

    /**
     * Explore the AST structure and apply the necessary transformations
     * The transformations are based on processors declared as static
     * members of this class.
     * Each processor is matched using the AST type and it may contain:
     * - pre: function to apply before exploring the AST
     * - post: function to apply after exploring the AST
     * - walk: override the AST exploring
     *
     * @param {Object} ast
     * @private
     */
    _walk: function (ast) {
        var
            myStatics = this.constructor,
            member,
            subItem,
            processor;
        if (ast instanceof Array) {
            this._walkArray(ast);
        } else {
            if (ast.type) {
                processor = myStatics[ast.type];
            }
            if (undefined !== processor && processor.pre) {
                processor.pre(ast, this);
            }
            if (undefined !== processor && processor.walk) {
                processor.walk(ast, this);
            } else {
                for (member in ast) {
                    if (ast.hasOwnProperty(member)) {
                        subItem = ast[member];
                        if ("object" === typeof subItem && subItem) {
                            this._walk(subItem);
                        }
                    }
                }
            }
            if (undefined !== processor && processor.post) {
                processor.post(ast, this);
            }
        }
    },

    /**
     * New name allocator (based on number of identifiers)
     *
     * @returns {String}
     * @private
     */
    _newName: function () {
        var
            id,
            newName,
            mod = identifierCharacters.length;
        do {
            id = this._identifierCount++;
            newName = [];
            while (id >= identifierCharacters.length) {
                newName.push(identifierCharacters.charAt(id % mod));
                id = id / mod;
            }
            newName.push(identifierCharacters.charAt(id));
            newName = newName.join("");
        } while (undefined !== gpf.test(gpf.js.keywords(), newName));
        return newName;
    }

    //endregion

};

/**
 * Test if the AST item has the request gpf: tag
 *
 * @param {Object} ast
 * @param {String} tag
 * @returns {boolean}
 */
ASTreducer.isTaggedWith = function (ast, tag) {
    var array,
        len,
        idx;
    if (!ast.leadingComments) {
        return false;
    }
    tag = "gpf:" + tag;
    array = ast.leadingComments;
    len = array.length;
    for (idx = 0; idx < len; ++idx) {
        if (array[idx].value === tag) {
            return true;
        }
    }
    return false;
};

ASTreducer.VariableDeclaration = {

    pre: function (ast, reducer) {
        var
            names = [],
            len = ast.declarations.length,
            idx,
            decl;
        for (idx = 0; idx < len; ++idx) {
            decl = ast.declarations[idx];
            if (!ASTreducer.isTaggedWith(decl, "no-reduce")) {
                names.push(decl.id.name);
            }
        }
        // TODO distinguish 'globals' from inner variables
        reducer.beginIdentifierMapping(names, true);
    }

};

ASTreducer.FunctionDeclaration = {

    pre: function (ast, reducer) {
        // Name is reduced at an higher level
        var
            names = [],
            idx,
            len;
        // Process parameters
        if (ast.params && ast.params.length) {
            len = ast.params.length;
            for (idx = 0; idx < len; ++idx) {
                names.push(ast.params[idx].name);
            }
        }
        reducer.beginIdentifierMapping(names, false);
    },

    post: function (ast, reducer) {
        // Clean parameters (and inner variables) substitutions
        reducer.endIdentifierMapping();
    }

};

ASTreducer.FunctionExpression = {

    pre: function (ast, reducer) {
        var
            names = [],
            len,
            idx,
            param;
        // Process parameters
        if (ast.params && ast.params.length) {
            len = ast.params.length;
            for (idx = 0; idx < len; ++idx) {
                param = ast.params[idx];
                if (!ASTreducer.isTaggedWith(param, "no-reduce")) {
                    names.push(ast.params[idx].name);
                }
            }
        }
        reducer.beginIdentifierMapping(names, false);
    },

    post: function (ast, reducer) {
        // Clean parameters (and inner variables) substitutions
        reducer.endIdentifierMapping();
    }

};

ASTreducer.Identifier = {

    pre: function (astItem, reducer) {
        // TODO Check the astParent avoid !MemberExpression.property
        var newName = reducer.isIdentifierMapped(astItem.name);
        if (undefined !== newName) {
            astItem.name = newName;
        }
    }

};

ASTreducer.MemberExpression = {

    walk: function (astItem, reducer) {
        reducer.reduce(astItem.object);
        // Reduce property only if computed
        if (astItem.computed) {
            reducer.reduce(astItem.property);
        }
    }

};

ASTreducer.ObjectExpression = {

    walk: function (astItem, reducer) {
        var len, idx;
        len = astItem.properties.length;
        for (idx = 0; idx < len; ++idx) {
            reducer.reduce(astItem.properties[idx].value);
        }
    }

};

module.exports = {

    /**
     * Transform the source into an AST representation
     *
     * @param {String} src
     * @return {Object} AST representation
     */
    transform: function (src) {
        // https://github.com/Constellation/escodegen/issues/85
        var
            ast = esprima.parse(src, {
                range: true,
                tokens: true,
                comment: true
            });
        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
        delete ast.tokens;
        delete ast.comments;
        return ast;
    },

    reduce: function (ast) {

    }


}