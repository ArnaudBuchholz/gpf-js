"use strict";

const
    esprima = require("esprima"),
    escodegen = require("escodegen"),
    parent$ = Symbol(),

    isTaggedWithGpf = (ast, tag) => ast.leadingComments
        ? ast.leadingComments.some(comment => comment.value === `gpf:${tag}`)
        : false,

    addAstComment = (ast, text) => {
        if (!Array.isArray(ast.leadingComments)) {
            ast.leadingComments = [];
        }
        ast.leadingComments.push({
            type: "Block",
            value: `gpf:ast.optimizer ${text}`
        });
    },

    getAstParent = (ast) => ast[parent$].ast,

    removeAst = astToRemove => {
        let {
                ast,
                member
            } = astToRemove[parent$],
            memberValue = ast[member];
        if (Array.isArray(memberValue)) {
            memberValue.splice(memberValue.indexOf(astToRemove), 1);
        } else {
            // Not sure it is safe to do so
            delete ast[member];
        }
    },

    analyzers = {

        VariableDeclaration: {

        },

        VariableDeclarator: {

            pre: (ast, optimizer) => {
                if (isTaggedWithGpf(ast, "nop")) {
                    optimizer.store("nop", ast.id.name, ast);
                }
            },

            walk: ["init"]

        },

        FunctionDeclaration: {

            pre: (ast, optimizer) => optimizer.store("function", ast.id.name, ast),

            walk: ["body"]

        },

        FunctionExpression: {

        },

        CallExpression: {

            pre: (ast, optimizer) => {
                let functionName;
                if (ast.callee.type === "Identifier") {
                    functionName = ast.callee.name;
                } else if (ast.callee.type === "MemberExpression" && ast.callee.object.type === "Identifier") {
                    functionName = ast.callee.object.name;
                }
                if (functionName) {
                    optimizer.inc("function", functionName, "callCount");
                }
            },

            walk: ["callee", "arguments"]

        },

        Identifier: {

            pre: (ast, optimizer) => {
                optimizer.inc("function", ast.name, "useCount");
                if (optimizer.retrieve("nop", ast.name) && getAstParent(ast).type === "CallExpression") {
                    optimizer.link("nop", ast.name, getAstParent(getAstParent(ast)));
                }
            },

            walk: null

        },

        MemberExpression: {

        },

        ObjectExpression: {

        },

        ExpressionStatement: {

            pre: (ast, optimizer) => {
                if (isTaggedWithGpf(ast, "nop") && ast.expression.type === "AssignmentExpression") {
                    optimizer.store("nop", ast.expression.left.name, ast);
                }
            }

        }

    };

class Optimizer {

    constructor (ast, settings, debug) {
        this._ast = ast;
        this._settings = settings;
        this._debug = debug;
    }

    debug (text) {
        this._debug(`\t\t${text}`);
    }

    //region Helpers to keep track of information through analysis

    _getStoreMap (category) {
        let memberName = `_${category}Map`,
            map = this[memberName];
        if (undefined === map) {
            map = this[memberName] = {};
        }
        return map;
    }

    store (category, key, ast) {
        if (key) {
            let data = {
                ast: ast
            };
            this.debug(`>> ${category}/${key}`);
            this._getStoreMap(category)[key] = data;
            return data;
        }
    }

    retrieve (category, key) {
        let storeMap = this._getStoreMap(category);
        if (storeMap.hasOwnProperty(key)) {
            return this._getStoreMap(category)[key];
        }
    }

    inc (category, key, counter) {
        let data = this.retrieve(category, key);
        if (data) {
            data[counter] = 1 + (data[counter] || 0);
        }
    }

    link (category, key, ast) {
        let data = this.retrieve(category, key);
        if (data) {
            if (!data.links) {
                data.links = [];
            }
            data .links.push(ast);
        }
    }

    //endregion

    //region Analyze

    analyze () {
        var dt = new Date();
        this._process(this._ast, this._analyze);
        addAstComment(this._ast, "time-spent analyze " + (new Date() - dt));
    }

    _analyze (ast) {
        let analyzer = analyzers[ast.type] || {};
        if (analyzer.pre) {
            analyzer.pre(ast, this);
        }
        this._walk(ast, this._analyze, analyzer.walk);
        if (analyzer.post) {
            analyzer.post(ast, this);
        }
    }

    //endregion

    //region Optimize

    _remove (ast, category, name) {
        this.debug(`${name} ${category} remove`);
        if (this._settings === true) {
            removeAst(ast);
        } else {
            addAstComment(ast, `${category} remove`);
        }
    }

    optimize () {
        let dt = new Date();
        Object.keys(this._getStoreMap("function")).forEach(name => {
            const {
                ast,
                callCount,
                useCount
            } = this.retrieve("function", name);
            addAstComment(ast, `function call-count ${callCount || 0}`);
            addAstComment(ast, `function use-count ${useCount || 0}`);
            if (!callCount && !useCount) {
                this._remove(ast, "function", name);
            }
        });
        Object.keys(this._getStoreMap("nop")).forEach(name => {
            const {
                ast,
                links
            } = this.retrieve("nop", name);
            this._remove(ast, "nop", name);
            (links || []).forEach(linkedAst => this._remove(linkedAst, "nop", `use-of ${name}`));
        });
        addAstComment(this._ast, "time-spent optimize " + (new Date() - dt));
    }

    //endregion

    _walk (ast, method, optionalMembers) {
        let members;
        if (undefined === optionalMembers) {
            members = Object.keys(ast);
        } else {
            members = optionalMembers;
        }
        if (members && members.length) {
            members
                .forEach(member => {
                    let astMember = ast[member];
                    if (typeof astMember === "object" && astMember) {
                        astMember[parent$] = {
                            ast: ast,
                            member: member
                        };
                        this._process(astMember, this._analyze);
                    }
                });
        }
    }

    _process (ast, method) {
        if (Array.isArray(ast)) {
            ast.forEach((astItem) => {
                if (typeof astItem === "object" && astItem) {
                    astItem[parent$] = ast[parent$];
                    this._process(astItem, method);
                }
            });
            delete ast._parent;
        } else {
            method.call(this, ast);
        }
    }

}

module.exports = {

    // Transform the source into an AST representation
    transform: function (src) {
        // https://github.com/Constellation/escodegen/issues/85
        let ast = esprima.parse(src, {
            range: true,
            tokens: true,
            comment: true
        });
        ast = escodegen.attachComments(ast, ast.comments, ast.tokens);
        delete ast.tokens;
        delete ast.comments;
        return ast;
    },

    // Detect & apply optimization patterns
    optimize: function (ast, setting, debug) {
        let optimizer = new Optimizer(ast, setting, debug);
        optimizer.analyze();
        optimizer.optimize();
        return ast;
    },

    // Generate source code from the AST
    rewrite: function (ast, options) {
        return escodegen.generate(ast, options);
    }

};
