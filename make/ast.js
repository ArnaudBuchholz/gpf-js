"use strict";

const
    esprima = require("esprima"),
    escodegen = require("escodegen"),
    parent$ = Symbol(),

    // Test if the AST item has the request gpf: tag
    // isTaggedWithGpf = (ast, tag) => ast.leadingComments
    //     ? ast.leadingComments.some(comment => comment.value === `gpf:${tag}`)
    //     : false,

    addAstComment = (ast, text) => {
        if (!Array.isArray(ast.leadingComments)) {
            ast.leadingComments = [];
        }
        ast.leadingComments.push({
            type: "Block",
            value: `gpf:ast.optimizer ${text}`
        });
    },

    analyzers = {

        VariableDeclaration: {

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

            walk: ["arguments"]

        },

        Identifier: {

            pre: (ast, optimizer) => optimizer.inc("function", ast.name, "useCount"),

            walk: null

        },

        MemberExpression: {

        },

        ObjectExpression: {

        }

    };

class Optimizer {

    constructor (ast) {
        this._ast = ast;
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
            this._getStoreMap(category)[key] = data;
            return data;
        }
    }

    retrieve (category, key) {
        let storeMap = this._getStoreMap(category);
        if (storeMap.hasOwnProperty(key))  {
            return this._getStoreMap(category)[key];
        }
    }

    inc (category, key, counter) {
        let data = this.retrieve(category, key);
        if (data) {
            data[counter] = 1 + (data[counter] || 0);
        }
    }

    //endregion

    //region Analyze

    analyze () {
        var dt = new Date();
        this._process(this._ast, this._analyze);
        addAstComment(this._ast, "time-spent(analyze) " + (new Date() - dt));
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

    optimize () {
        let dt = new Date();
        Object.keys(this._getStoreMap("function")).forEach(name => {
            const {
                ast,
                callCount,
                useCount
            } = this.retrieve("function", name);
            addAstComment(ast, `function call-count ${callCount}`);
            addAstComment(ast, `function use-count ${useCount}`);
            if (!callCount && !useCount) {
                addAstComment(ast, "function remove");
            }
        });
        addAstComment(this._ast, "time-spent(optimize) " + (new Date() - dt));
    }

    //endregion

    _walk (ast, method, members) {
        if (undefined === members) {
            members = Object.keys(ast);
        }
        if (members && members.length) {
            members
                .forEach(member => {
                    let astMember = ast[member];
                    if ("object" === typeof astMember && astMember) {
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
            ast.forEach((astItem, index) => {
                if ("object" === typeof astItem && astItem) {
                    astItem[parent$] = Object.create(ast[parent$]);
                    astItem[parent$].index = index;
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
    optimize: function (ast) {
        let optimizer = new Optimizer(ast);
        optimizer.analyze();
        optimizer.optimize();
        return ast;
    },

    // Generate source code from the AST
    rewrite: function (ast, options) {
        return escodegen.generate(ast, options);
    }

};
