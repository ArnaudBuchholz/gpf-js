"use strict";

const
    esprima = require("esprima"),
    escodegen = require("escodegen"),

    // Test if the AST item has the request gpf: tag
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
            }

        },

        FunctionExpression: {

        },

        CallExpression: {

            pre: (ast, optimizer) => {
                var functionData = optimizer._functions ? optimizer._functions[ast.callee.name] : null;
                if (functionData) {
                    ++functionData.callCount;
                }
            }

        },

        Identifier: {

            pre: (ast, optimizer) => {
                var functionData = optimizer._functions ? optimizer._functions[ast.name] : null;
                if (functionData) {
                    ++functionData.useCount;
                }
            }

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
        this._walk(this._ast, this._analyze);
        addAstComment(this._ast, "time-spent(analyze) " + (new Date() - dt));
    }

    _analyze (ast) {
        let analyzer = analyzers[ast.type] || {};
        if (analyzer.pre) {
            analyzer.pre(ast, this);
        }
        if (analyzer.walk) {
            analyzer.walk(ast, this);
        } else {
            Object.keys(ast).forEach(member => {
                let astMember = ast[member];
                if ("object" === typeof astMember && astMember) {
                    this._walk(astMember, this._analyze);
                }
            });
        }
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
            });
        }
        addAstComment(this._ast, "time-spent(optimize) " + (new Date() - dt));
    }

    //endregion

    _walk (ast, method) {
        if (Array.isArray(ast)) {
            ast.forEach(astItem => this._walk(astItem, method));
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
