"use strict";

const
    esprima = require("esprima"),
    escodegen = require("escodegen"),
    parent$ = Symbol("Hidden parent property"),

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

            pre: (ast, optimizer) => {
                let name = ast.id.name;
                if (!optimizer._functions) {
                    optimizer._functions = {};
                }
                optimizer._functions[name] = {
                    ast: ast,
                    callCount: 0,
                    useCount: 0
                };
            },

            walk: ["body"]

        },

        FunctionExpression: {

        },

        CallExpression: {

            pre: (ast, optimizer) => {
                let functionData,
                    functionName;
                if (ast.callee.type === "Identifier") {
                    functionName = ast.callee.name;
                } else if (ast.callee.type === "MemberExpression" && ast.callee.object.type === "Identifier") {
                    functionName = ast.callee.object.name;
                }
                if (functionName) {
                    functionData = optimizer._functions ? optimizer._functions[functionName] : null;
                    if (functionData) {
                        ++functionData.callCount;
                    }
                }
            },

            walk: ["arguments"]

        },

        Identifier: {

            pre: (ast, optimizer) => {
                var functionData = optimizer._functions ? optimizer._functions[ast.name] : null;
                if (functionData) {
                    ++functionData.useCount;
                }
            },

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
        var dt = new Date();
        if (this._functions) {
            Object.keys(this._functions).forEach(name => {
                var functionData = this._functions[name];
                addAstComment(functionData.ast, `call-count ${functionData.callCount}`);
                addAstComment(functionData.ast, `use-count ${functionData.useCount}`);
                if (functionData.callCount === 0 && functionData.useCount === 0) {
                    addAstComment(functionData.ast, "remove");
                }
            });
        }
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
