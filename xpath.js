(function(){ /* Begin of privacy scope */
    "use strict";
    /*global document,window,console*/
    /*global process,require,exports,global*/
    /*global gpf*/
    /*jslint continue: true, nomen: true, plusplus: true*/

    var
        gpfG = gpf.grammar,

        rule = gpfG.rule, // Defines a rule with one or more choices
        ref = gpfG.ref, // Reference to an existing rule
        opt = gpfG.opt, // (Reference to an existing rule)?
        any = gpfG.any, // (Reference to an existing rule)*


        // Based on http://www.galiel.net/el/study/XPath_Overview.html
        _xpathGrammar = {};
/*
// LocationPath ::= RelativeLocationPath | AbsoluteLocationPath
            "LocationPath": rule(ref("RelativeLocationPath"),
                ref("AbsoluteLocationPath")),
// AbsoluteLocationPath ::= '/' RelativeLocationPath?
//                          | AbbreviatedAbsoluteLocationPath
            "AbsoluteLocationPath": rule(["/", opt("RelativeLocationPath")],
                ref("AbbreviatedAbsoluteLocationPath"))
// RelativeLocationPath ::= Step | RelativeLocationPath '/' Step
//                        | AbbreviatedRelativeLocationPath
            "RelativeLocationPath": rule(ref("Step"),
                [ref("RelativeLocationPath"), "/", ref("Step")],
                ref("AbbreviatedAbsoluteLocationPath")),
// Step ::= AxisSpecifier NodeTest Predicate* | AbbreviatedStep
            "Step": rule([ref("AxisSpecifier"), ref("NodeTest"),
                any("Predicate")], ref("AbbreviatedStep")),
// AxisSpecifier ::= AxisName '::' | AbbreviatedAxisSpecifier
            "AxisSpecifier": rule([ref("AxisName"), "::"],
                ref("AbbreviatedAxisSpecifier")),
// AxisName ::= 'ancestor' | 'ancestor-or-self' | 'attribute' | 'child'
//              | 'descendant' | 'descendant-or-self' | 'following'
//              | 'following-sibling' | 'namespace' | 'parent' | 'preceding'
//              | 'preceding-sibling' | 'self'
            'AxisName': gpfG.rule("ancestor", "ancestor-or-self", "attribute",
                "child", "descendant", "descendant-or-self", "following",
                "following-sibling", "namespace", "parent", "preceding",
                "preceding-sibling", "self"),

        };
|

            [7] NodeTest ::= NameTest | NodeType '(' ')'
| 'processing-instruction' '(' Literal ')'
    [8] Predicate ::= '[' PredicateExpr ']'
    [9] PredicateExpr ::= Expr
    [10] AbbreviatedAbsoluteLocationPath ::= '//' RelativeLocationPath
    [11] AbbreviatedRelativeLocationPath ::= RelativeLocationPath '//' Step
    [12] AbbreviatedStep ::= '.' | '..'
    [13] AbbreviatedAxisSpecifier ::= '@'?
    [14] Expr ::= OrExpr
    [15] PrimaryExpr ::= VariableReference | '(' Expr ')' | Literal
    | Number | FunctionCall
    [16] FunctionCall ::= FunctionName '(' ( Argument ( ',' Argument )* )? ')'
    [17] Argument ::= Expr
    [18] UnionExpr ::= PathExpr | UnionExpr '|' PathExpr
    [19] PathExpr ::= LocationPath | FilterExpr
    | FilterExpr '/' RelativeLocationPath
| FilterExpr '//' RelativeLocationPath
    [20] FilterExpr ::= PrimaryExpr | FilterExpr Predicate
    [21] OrExpr ::= AndExpr | OrExpr 'or' AndExpr
    [22] AndExpr ::= EqualityExpr | AndExpr 'and' EqualityExpr
    [23] EqualityExpr ::= RelationalExpr | EqualityExpr '=' RelationalExpr
| EqualityExpr '!=' RelationalExpr
    [24] RelationalExpr ::= AdditiveExpr
    | RelationalExpr '<' AdditiveExpr
| RelationalExpr '>' AdditiveExpr
| RelationalExpr '<=' AdditiveExpr
| RelationalExpr '>=' AdditiveExpr
    [25] AdditiveExpr ::= MultiplicativeExpr
    | AdditiveExpr '+' MultiplicativeExpr
| AdditiveExpr '-' MultiplicativeExpr
    [26] MultiplicativeExpr ::= UnaryExpr
    | MultiplicativeExpr MultiplyOperator UnaryExpr
| MultiplicativeExpr 'div' UnaryExpr
| MultiplicativeExpr 'mod' UnaryExpr
    [27] UnaryExpr ::= UnionExpr | '-' UnaryExpr
    [28] ExprToken ::= '(' | ')' | '[' | ']' | '.' | '..' | '@' | ',' | '::'
    | NameTest | NodeType | Operator | FunctionName
    | AxisName | Literal | Number | VariableReference
    [29] Literal ::= '"' [^"]* '"' | "'" [^']* "'"
    [30] Number ::= Digits ('.' Digits?)? | '.' Digits
    [31] Digits ::= [0-9]+
    [32] Operator ::= OperatorName | MultiplyOperator | '/' | '//' | '|'
    | '+' | '-' | '=' | '!=' | '<' | '<=' | '>' | '>='
    [33] OperatorName ::= 'and' | 'or' | 'mod' | 'div'
    [34] MultiplyOperator ::= '*'
    [35] FunctionName ::= QName - NodeType
    [36] VariableReference ::= '$' QName
    [37] NameTest ::= '*' | NCName ':' '*' | QName
    [38] NodeType ::= 'comment' | 'text' | 'processing-instruction' | 'node'
    [39] ExprWhitespace ::= S

*/

}()); /* End of privacy scope */
