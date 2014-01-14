/**
 * Created by Nono et Nano on 13/01/14.
 */
var text = 
      "[1] LocationPath ::= RelativeLocationPath | AbsoluteLocationPath\n"
    + "[2] AbsoluteLocationPath ::= '/' RelativeLocationPath?\n"
    + "                               | AbbreviatedAbsoluteLocationPath\n"
    + "[3] RelativeLocationPath ::= Step | RelativeLocationPath '/' Step\n"
    + "                           | AbbreviatedRelativeLocationPath\n"
    + "[4] Step ::= AxisSpecifier NodeTest Predicate* | AbbreviatedStep\n"
    + "[5] AxisSpecifier ::= AxisName '::' | AbbreviatedAxisSpecifier\n"
    + "[6] AxisName ::=\n"
    + "        'ancestor' |\n"
    + "        'ancestor-or-self' |\n"
    + "        'attribute' |\n"
    + "        'child' |\n"
    + "        'descendant' |\n"
    + "        'descendant-or-self' |\n"
    + "        'following' |\n"
    + "        'following-sibling' |\n"
    + "        'namespace' |\n"
    + "        'parent' |\n"
    + "        'preceding' |\n"
    + "        'preceding-sibling' |\n"
    + "        'self'\n"
    + "[7] NodeTest ::= NameTest | NodeType '(' ')'\n"
    + "               | 'processing-instruction' '(' Literal ')'\n"
    + "[8] Predicate ::= '[' PredicateExpr ']'\n"
    + "[9] PredicateExpr ::= Expr\n"
    + "[10] AbbreviatedAbsoluteLocationPath ::= '//' RelativeLocationPath\n"
    + "[11] AbbreviatedRelativeLocationPath ::= RelativeLocationPath '//' Step\n"
    + "[12] AbbreviatedStep ::= '.' | '..'\n"
    + "[13] AbbreviatedAxisSpecifier ::= '@'?\n"
    + "[14] Expr ::= OrExpr\n"
    + "[15] PrimaryExpr ::= VariableReference | '(' Expr ')' | Literal\n"
    + "                   | Number | FunctionCall\n"
    + "[16] FunctionCall ::= FunctionName '(' ( Argument ( ',' Argument )* )? ')'\n"
    + "[17] Argument ::= Expr\n"
    + "[18] UnionExpr ::= PathExpr | UnionExpr '|' PathExpr\n"
    + "[19] PathExpr ::= LocationPath | FilterExpr\n"
    + "                | FilterExpr '/' RelativeLocationPath\n"
    + "                | FilterExpr '//' RelativeLocationPath\n"
    + "[20] FilterExpr ::= PrimaryExpr | FilterExpr Predicate\n"
    + "[21] OrExpr ::= AndExpr | OrExpr 'or' AndExpr\n"
    + "[22] AndExpr ::= EqualityExpr | AndExpr 'and' EqualityExpr\n"
    + "[23] EqualityExpr ::= RelationalExpr | EqualityExpr '=' RelationalExpr\n"
    + "                    | EqualityExpr '!=' RelationalExpr\n"
    + "[24] RelationalExpr ::= AdditiveExpr\n"
    + "                      | RelationalExpr '<' AdditiveExpr\n"
    + "                      | RelationalExpr '>' AdditiveExpr\n"
    + "                      | RelationalExpr '<=' AdditiveExpr\n"
    + "                      | RelationalExpr '>=' AdditiveExpr\n"
    + "[25] AdditiveExpr ::= MultiplicativeExpr\n"
    + "                    | AdditiveExpr '+' MultiplicativeExpr\n"
    + "                    | AdditiveExpr '-' MultiplicativeExpr\n"
    + "[26] MultiplicativeExpr ::= UnaryExpr\n"
    + "                          | MultiplicativeExpr MultiplyOperator UnaryExpr\n"
    + "                          | MultiplicativeExpr 'div' UnaryExpr\n"
    + "                          | MultiplicativeExpr 'mod' UnaryExpr\n"
    + "[27] UnaryExpr ::= UnionExpr | '-' UnaryExpr\n"
    + "[28] ExprToken ::= '(' | ')' | '[' | ']' | '.' | '..' | '@' | ',' | '::'\n"
    + "                 | NameTest | NodeType | Operator | FunctionName\n"
    + "                 | AxisName | Literal | Number | VariableReference\n"
    + "[29] Literal ::= '\"' [^\"]* '\"' | \"'\" [^']* \"'\"\n"
    + "[30] Number ::= Digits ('.' Digits?)? | '.' Digits\n"
    + "[31] Digits ::= [0-9]+\n"
    + "[32] Operator ::= OperatorName | MultiplyOperator | '/' | '//' | '|'\n"
    + "                | '+' | '-' | '=' | '!=' | '<' | '<=' | '>' | '>='\n"
    + "[33] OperatorName ::= 'and' | 'or' | 'mod' | 'div'\n"
    + "[34] MultiplyOperator ::= '*'\n"
    + "[35] FunctionName ::= QName - NodeType\n"
    + "[36] VariableReference ::= '$' QName\n"
    + "[37] NameTest ::= '*' | NCName ':' '*' | QName\n"
    + "[38] NodeType ::= 'comment' | 'text' | 'processing-instruction' | 'node'\n"
    + "[39] ExprWhitespace ::= S\n";

console.log(text);

function rule() {
  // Use arguments
}

function ref(name) {

}

function opt(name) {

}

function any(name) {

}

var _grammar = {
    'rule': rule(['[', ref("number"), ']', ref("name"), '::=', ref("content")]),
    'number': token('[0-9]+'),
    'name': token('[a-z]+'),
    'content': rule(ref("items"), [ref("content") '|' ref("items")]),
    'items':

}
