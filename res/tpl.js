/**
 * Simple template mechanism based on html template tag.
 * Once the template DOM element is retrieved, call buildFactory to obtain a function which signature is
 * function (item, index) and that returns a DOM content.
 *
 * Inside the template, supported expressions are:
 * - {memberName} will be replace with member value of item
 * - {%%}="code" will be evaluated with $item=item, $index=index and $write(value)
 * - (% code %} will be injected in the function with $item=item and $index=index
 *
 * Code evaluation
 */
(function () {
    "use strict";

    var _reExpressions = /\{\{([a-zA-Z_][a-zA-Z_0-9]+)\}\}|\{%%\}="([^"]+)"|\{%((?:[^%]|%[^\}])*)%\}|([^\{]+)/g,
        _reQuote = /\"/g,
        _reCarriageReturn = /\n/g,
        _Func = Function,
        _parser = new DOMParser(),
        _nameOfObject = "$object",
        _nameOfIndex = "$index",
        _nameOfWrite = "$write";

    function _toJsString (value) {
        return value
            .replace(_reQuote, "\\\"")
            .replace(_reCarriageReturn, "\\n")
        ;
    }

    function _decodeHtml (html) {
        return _parser.parseFromString(html, "text/html").documentElement.textContent;
    }

    function _buildFactory () {
        /*jshint validthis:true*/
        var baseHtml = this.innerHTML,
            token,
            matchedValue,
            code = [
                "var __a=arguments,",
                _nameOfObject, "=__a[0],",
                _nameOfIndex, "=__a[1],",
                "__r=[],__d=document,",
                "__t=__d.createElement(\"template\");",
                "function __s(v){if(undefined===v)return \"\";return v.toString();}",
                "function ", _nameOfWrite, "(t){__r.push(__s(t));}"
            ];
        _reExpressions.lastIndex = 0;
        while (null !== (token = _reExpressions.exec(baseHtml))) {
            matchedValue = token[0];
            if (matchedValue.charAt(0) !== "{") {
                // html code
                code.push("__r.push(\"", _toJsString(matchedValue), "\");");
            } else if (matchedValue.substr(1, 3) === "%%}") {
                // {%%}=""
                code.push(_decodeHtml(token[2]));
            } else if (matchedValue.charAt(1) === "%") {
                // {% %}
                code.push(_decodeHtml(token[3]));
            } else {
                // {{name}}
                code.push("__r.push(__s(", _nameOfObject, ".", token[1], "));");
            }
        }
        code.push("__t.innerHTML=__r.join(\"\");return __d.importNode(__t.content,true);");
        return new _Func(code.join(""));
    }

    if (window.HTMLTemplateElement) {
        window.HTMLTemplateElement.prototype.buildFactory = _buildFactory;
    }

}());
