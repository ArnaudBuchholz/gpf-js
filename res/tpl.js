/**
 * Simple template handler
 */
(function () {
    "use strict";

    /**
     * Simple template mechanism based on html template tag.
     * Once the template element is retrieved, use getFactory to obtain a function which signature is:
     * function (object, index)
     * And that returns a DOM content.
     *
     * Inside the template, supported expressions are:
     * {memberName} will be replace with member value of object
     * {}="code" will be evaluated with this=object and $index=index
     */
    var _reExpressions = /\{([a-zA-Z_][a-zA-Z_0-9]+)\}|\{\}="([^"]+)"|([^\{]+)/g,
        _reQuote = /\"/g,
        _reCarriageReturn = /\n/g,
        _Func = Function,
        _parser = new DOMParser();

    function _toJsString (value) {
        return value
            .replace(_reQuote, "\\\"")
            .replace(_reCarriageReturn, "\\n")
        ;
    }

    function _decodeHtml (html) {
        return _parser.parseFromString(html, "text/html").documentElement.textContent;
    }

    if (window.HTMLTemplateElement) {
        window.HTMLTemplateElement.prototype.getFactory = function () {
            var baseHtml = this.innerHTML,
                code = ["var a=arguments,o=a[0],i=a[1],r=[],d=document,t=d.createElement(\"template\");"],
                token,
                matchedValue;
            _reExpressions.lastIndex = 0;
            while (null !== (token = _reExpressions.exec(baseHtml))) {
                matchedValue = token[0];
                if (matchedValue.charAt(0) !== "{") {
                    code.push("r.push(\"", _toJsString(matchedValue), "\");");
                } else if (matchedValue.charAt(1) === "}") {
                    // {}=""
                    code.push("r.push((function($index){\n\t", _decodeHtml(token[2]), "\n}).call(o,i));");
                } else {
                    // {Name}
                    code.push("r.push(o.", token[1], ".toString());");
                }
            }
            code.push("t.innerHTML=r.join(\"\");return d.importNode(t.content,true);");
            return new _Func(code.join(""));
        };
    }

}());
